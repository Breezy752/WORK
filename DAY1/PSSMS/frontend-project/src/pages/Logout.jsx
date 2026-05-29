import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/userAPI';

function Logout({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try { await logoutUser(); } catch { /* ignore */ }
    setUser(null);
    setDone(true);
    setTimeout(() => navigate('/login'), 1500);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center w-full max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-green-600 text-3xl font-bold">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Signed Out</h2>
          <p className="text-gray-500 text-sm">You have been logged out successfully.</p>
          <p className="text-gray-400 text-xs mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 text-center w-full max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <span className="text-red-600 text-2xl">🔓</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sign Out</h2>
        <p className="text-gray-500 text-sm mb-8">
          Are you sure you want to log out of <span className="font-semibold text-blue-700">SmartPark</span>?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            {loading ? 'Signing out...' : 'Yes, Sign Out'}
          </button>
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;
