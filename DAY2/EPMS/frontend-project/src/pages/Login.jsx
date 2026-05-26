import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d1500 100%)'}}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl shadow-2xl p-8" style={{background: '#111111', border: '1px solid #f97316'}}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">SmartPark EPMS</h1>
            <p className="text-sm mt-1" style={{color: '#f97316'}}>Employee Payroll Management System</p>
            <p className="text-xs mt-1" style={{color: '#6b7280'}}>Rubavu District, Western Province, Rwanda</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{background: '#2d0000', border: '1px solid #ef4444', color: '#fca5a5'}}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#d1d5db'}}>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Enter username"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{background: '#1f1f1f', border: '1px solid #374151'}}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#d1d5db'}}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{background: '#1f1f1f', border: '1px solid #374151'}}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 rounded-lg transition-all duration-200 text-white"
              style={{background: loading ? '#9a3412' : 'linear-gradient(135deg, #f97316, #ea580c)'}}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{color: '#6b7280'}}>Default: admin / admin123</p>
          <p className="text-center text-sm mt-3" style={{color: '#9ca3af'}}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline" style={{color: '#f97316'}}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
