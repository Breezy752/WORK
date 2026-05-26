import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await api.post('/auth/register', { username: form.username, password: form.password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d1500 100%)'}}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-2xl p-8" style={{background: '#111111', border: '1px solid #f97316'}}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-sm mt-1" style={{color: '#f97316'}}>SmartPark EPMS — Register</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{background: '#2d0000', border: '1px solid #ef4444', color: '#fca5a5'}}>
                {error}
              </div>
            )}
            {success && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{background: '#052e16', border: '1px solid #16a34a', color: '#86efac'}}>
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#d1d5db'}}>Username</label>
              <input
                type="text" name="username" value={form.username} onChange={handleChange} required
                placeholder="Choose a username"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{background: '#1f1f1f', border: '1px solid #374151'}}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#d1d5db'}}>Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="At least 6 characters"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{background: '#1f1f1f', border: '1px solid #374151'}}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#d1d5db'}}>Confirm Password</label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                placeholder="Repeat your password"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{background: '#1f1f1f', border: '1px solid #374151'}}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full font-semibold py-2.5 rounded-lg transition-all duration-200 text-white"
              style={{background: loading ? '#9a3412' : 'linear-gradient(135deg, #f97316, #ea580c)'}}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{color: '#9ca3af'}}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{color: '#f97316'}}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
