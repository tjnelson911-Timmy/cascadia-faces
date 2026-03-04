import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm';

export default function Login() {
  const { login, changePassword, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // If already logged in and doesn't need password change, redirect
  if (user && !user.mustChangePassword && !showChangePassword) {
    navigate('/', { replace: true });
    return null;
  }

  // Show change password form after successful login with mustChangePassword
  if (showChangePassword || (user && user.mustChangePassword)) {
    return (
      <ChangePasswordForm
        onSubmit={async (newPassword) => {
          await changePassword(newPassword);
          navigate('/', { replace: true });
        }}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        setError(result.error);
      } else if (result.mustChangePassword) {
        setShowChangePassword(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <svg viewBox="0 0 32 32" className="w-12 h-12 mx-auto mb-4" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="#0b7280" />
            <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui, sans-serif">
              &#9733;
            </text>
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">
            The Stars of Cascadia
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in with your work email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
              placeholder="name@cascadiahc.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-cascadia-600 text-white rounded-lg font-medium hover:bg-cascadia-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Cascadia Healthcare &mdash; A Force for Good
        </p>
      </div>
    </div>
  );
}
