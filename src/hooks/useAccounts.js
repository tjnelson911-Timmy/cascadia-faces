import { useLocalStorage } from './useLocalStorage';
import { getDefaultPasswordHash } from '../utils/authUtils';

const STORAGE_KEY = 'cascadia-accounts';
const EMPLOYEES_KEY = 'cascadia-employees';

const ADMIN_EMAIL = 'admin@cascadiahc.com';

export function useAccounts() {
  const [accounts, setAccounts] = useLocalStorage(STORAGE_KEY, null);

  // Initialize admin + sync all employee accounts on first load
  const init = async () => {
    const hash = await getDefaultPasswordHash();

    // Read accounts and employees directly from localStorage to avoid stale state
    let current;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      current = raw ? JSON.parse(raw) : null;
    } catch {
      current = null;
    }

    let employees;
    try {
      const raw = localStorage.getItem(EMPLOYEES_KEY);
      employees = raw ? JSON.parse(raw) : [];
    } catch {
      employees = [];
    }

    // Start with existing accounts or create admin
    const base = current || [
      {
        email: ADMIN_EMAIL,
        passwordHash: hash,
        role: 'admin',
        mustChangePassword: true,
        employeeId: null,
      },
    ];

    // Ensure accounts exist for all employees with emails
    const existingEmails = new Set(base.map((a) => a.email.toLowerCase()));
    const newAccounts = [];
    for (const emp of employees) {
      if (emp.email && !existingEmails.has(emp.email.toLowerCase())) {
        newAccounts.push({
          email: emp.email,
          passwordHash: hash,
          role: 'user',
          mustChangePassword: true,
          employeeId: emp.id,
        });
        existingEmails.add(emp.email.toLowerCase());
      }
    }

    const merged = [...base, ...newAccounts];
    if (!current || newAccounts.length > 0) {
      setAccounts(merged);
    }
    return merged;
  };

  const getAccount = (email) => {
    if (!accounts) return null;
    return accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    ) || null;
  };

  const updateAccount = (email, updates) => {
    setAccounts((prev) =>
      (prev || []).map((a) =>
        a.email.toLowerCase() === email.toLowerCase()
          ? { ...a, ...updates }
          : a
      )
    );
  };

  const ensureAccountForEmployee = async (employee) => {
    if (!employee.email) return;
    const existing = (accounts || []).find(
      (a) => a.email.toLowerCase() === employee.email.toLowerCase()
    );
    if (existing) {
      if (existing.employeeId !== employee.id) {
        updateAccount(employee.email, { employeeId: employee.id });
      }
      return;
    }
    const hash = await getDefaultPasswordHash();
    setAccounts((prev) => [
      ...(prev || []),
      {
        email: employee.email,
        passwordHash: hash,
        role: 'user',
        mustChangePassword: true,
        employeeId: employee.id,
      },
    ]);
  };

  const ensureAccountsForEmployees = async (employees) => {
    const hash = await getDefaultPasswordHash();
    // Read directly from localStorage for freshest state
    let current;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      current = raw ? JSON.parse(raw) : [];
    } catch {
      current = [];
    }
    const existingEmails = new Set(
      current.map((a) => a.email.toLowerCase())
    );
    const newAccounts = [];
    for (const emp of employees) {
      if (emp.email && !existingEmails.has(emp.email.toLowerCase())) {
        newAccounts.push({
          email: emp.email,
          passwordHash: hash,
          role: 'user',
          mustChangePassword: true,
          employeeId: emp.id,
        });
        existingEmails.add(emp.email.toLowerCase());
      }
    }
    if (newAccounts.length > 0) {
      setAccounts((prev) => [...(prev || []), ...newAccounts]);
    }
  };

  const removeAccountForEmployee = (employeeId) => {
    setAccounts((prev) =>
      (prev || []).filter(
        (a) => a.role === 'admin' || a.employeeId !== employeeId
      )
    );
  };

  const rebuildAccountsForEmployees = async (employees) => {
    const hash = await getDefaultPasswordHash();
    const admin = (accounts || []).find((a) => a.role === 'admin');
    const adminAccount = admin || {
      email: ADMIN_EMAIL,
      passwordHash: hash,
      role: 'admin',
      mustChangePassword: true,
      employeeId: null,
    };
    const employeeAccounts = employees
      .filter((emp) => emp.email)
      .map((emp) => {
        const existing = (accounts || []).find(
          (a) =>
            a.email.toLowerCase() === emp.email.toLowerCase() &&
            a.role !== 'admin'
        );
        if (existing) {
          return { ...existing, employeeId: emp.id };
        }
        return {
          email: emp.email,
          passwordHash: hash,
          role: 'user',
          mustChangePassword: true,
          employeeId: emp.id,
        };
      });
    setAccounts([adminAccount, ...employeeAccounts]);
  };

  const resetPassword = async (email) => {
    const hash = await getDefaultPasswordHash();
    updateAccount(email, { passwordHash: hash, mustChangePassword: true });
  };

  return {
    accounts: accounts || [],
    init,
    getAccount,
    updateAccount,
    resetPassword,
    ensureAccountForEmployee,
    ensureAccountsForEmployees,
    removeAccountForEmployee,
    rebuildAccountsForEmployees,
  };
}

export { ADMIN_EMAIL };
