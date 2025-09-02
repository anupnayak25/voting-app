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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Login
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
            message.startsWith('Authenticated') ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
