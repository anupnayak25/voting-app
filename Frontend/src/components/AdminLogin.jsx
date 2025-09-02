import React, { useState } from 'react';

export default function AdminLogin({ onAdminLogin }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const adminPassEnv = import.meta.env.VITE_ADMIN_PASS;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (!password) return setMessage('Password required');
    if (password === adminPassEnv) {
      setMessage('Authenticated. Redirecting...');
      onAdminLogin();
    } else {
      setMessage('Invalid admin password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm border border-primary-100">
        <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-3"
          >
            Login
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
            message.startsWith('Authenticated') ? 'bg-accent-50 text-accent-700 border border-accent-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
