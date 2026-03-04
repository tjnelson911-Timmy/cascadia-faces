import { useState } from 'react';

export default function ChangePasswordForm({ onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password === 'Cascadia1') {
      setError('Please choose a different password.');
      return;
    }
    onSubmit(password);
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
          <h1 className="text-2xl font-bold text-gray-900">Change Your Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            Please set a new password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
              placeholder="Re-enter your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-cascadia-600 text-white rounded-lg font-medium hover:bg-cascadia-700 transition-colors"
          >
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
}
