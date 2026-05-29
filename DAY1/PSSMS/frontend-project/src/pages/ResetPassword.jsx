import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/userAPI';

function ResetPassword() {
  const [form, setForm] = useState({ username: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.newPassword || !form.confirmPassword) { setError('All fields are required.'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await resetPassword({ username: form.username, newPassword: form.newPassword });
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-900 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
              <span className="text-blue-900 font-black text-2xl">SP</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-blue-300 text-sm mt-1">Enter your username and new password</p>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                <span className="font-bold">!</span> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">
                <span className="font-bold">✓</span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'username', label: 'Username', type: 'text', placeholder: 'Your username' },
                { name: 'newPassword', label: 'New Password', type: 'password', placeholder: 'New strong password' },
                { name: 'confirmPassword', label: 'Confirm New Password', type: 'password', placeholder: 'Repeat new password' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              ))}
              <button
                type="submit" disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 mt-2"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <p className="mt-6 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">← Back to Login</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-blue-400 text-xs mt-5">SmartPark © 2025 — Rubavu District, Rwanda</p>
      </div>
    </div>
  );
}

export default ResetPassword;
