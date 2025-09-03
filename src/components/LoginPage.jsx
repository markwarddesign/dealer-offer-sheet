import React, { useState } from 'react';
import { loginAdmin, loginDemo } from '../utils/auth';

const logo = (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="32" fill="#1e293b"/>
    <text x="32" y="40" textAnchor="middle" fontSize="28" fill="#fff" fontFamily="monospace" fontWeight="bold">M</text>
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdmin = (e) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      onLogin();
    } else {
      setError('Invalid admin password');
    }
  };

  const handleDemo = () => {
    loginDemo();
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md flex flex-col items-center">
        <div className="mb-4">{logo}</div>
        <h1 className="text-2xl font-bold text-blue-900 mb-1 tracking-widest">M.I.L.E.S.</h1>
        <p className="text-blue-700 mb-6 text-center font-medium">Monthly Investment & Lifetime Expense Savings</p>
        <form onSubmit={handleAdmin} className="w-full flex flex-col gap-3">
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <button type="submit" className="bg-blue-700 text-white rounded py-2 font-bold hover:bg-blue-800 transition">Admin Login</button>
        </form>
        <button onClick={handleDemo} className="mt-4 text-blue-700 underline hover:text-blue-900">Demo Access (1 hour)</button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
