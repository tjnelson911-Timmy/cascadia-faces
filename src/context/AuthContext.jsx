import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccounts, ADMIN_EMAIL } from '../hooks/useAccounts';
import { verifyPassword, hashPassword, getDefaultPasswordHash } from '../utils/authUtils';

const AuthContext = createContext(null);

const SESSION_KEY = 'cascadia-session';

export function AuthProvider({ children }) {
  const {
    accounts,
    init,
    getAccount,
    updateAccount,
    resetPassword,
    ensureAccountForEmployee,
    ensureAccountsForEmployees,
    removeAccountForEmployee,
    rebuildAccountsForEmployees,
  } = useAccounts();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  // Initialize accounts on first mount (creates admin + syncs all employee accounts)
  useEffect(() => {
    init().then(() => setReady(true));
  }, []);

  // Keep session in sync with account changes (e.g., after password change)
  useEffect(() => {
    if (user) {
      const account = getAccount(user.email);
      if (account) {
        const updated = {
          email: account.email,
          role: account.role,
          mustChangePassword: account.mustChangePassword,
          employeeId: account.employeeId,
        };
        // Only update if something changed
        if (JSON.stringify(updated) !== JSON.stringify(user)) {
          setUser(updated);
          localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        }
      }
    }
  }, [accounts]);

  const login = useCallback(
    async (email, password) => {
      let account = getAccount(email);

      // If no account found, check if an employee with this email exists
      // and auto-create their account (handles cross-device localStorage)
      if (!account) {
        try {
          const employees = JSON.parse(
            localStorage.getItem('cascadia-employees') || '[]'
          );
          const emp = employees.find(
            (e) => e.email && e.email.toLowerCase() === email.trim().toLowerCase()
          );
          if (emp) {
            const hash = await getDefaultPasswordHash();
            const newAccount = {
              email: emp.email,
              passwordHash: hash,
              role: 'user',
              mustChangePassword: true,
              employeeId: emp.id,
            };
            await ensureAccountForEmployee(emp);
            account = newAccount;
          }
        } catch { /* ignore */ }
      }

      if (!account) {
        return { success: false, error: 'No account found for this email.' };
      }
      const valid = await verifyPassword(password, account.passwordHash);
      if (!valid) {
        return { success: false, error: 'Incorrect password.' };
      }
      const session = {
        email: account.email,
        role: account.role,
        mustChangePassword: account.mustChangePassword,
        employeeId: account.employeeId,
      };
      setUser(session);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, mustChangePassword: account.mustChangePassword };
    },
    [getAccount, ensureAccountForEmployee]
  );

  const changePassword = useCallback(
    async (newPassword) => {
      if (!user) return;
      const newHash = await hashPassword(newPassword);
      updateAccount(user.email, {
        passwordHash: newHash,
        mustChangePassword: false,
      });
      const updated = { ...user, mustChangePassword: false };
      setUser(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    },
    [user, updateAccount]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    ready,
    login,
    logout,
    changePassword,
    isAdmin,
    // Expose account management for Admin page
    resetPassword,
    ensureAccountForEmployee,
    ensureAccountsForEmployees,
    removeAccountForEmployee,
    rebuildAccountsForEmployees,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
