import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { checkSession } from './api/userAPI';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import ParkingSlots from './pages/ParkingSlots';
import ParkingRecords from './pages/ParkingRecords';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Logout from './pages/Logout';

// Protected route wrapper
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Layout with navbar
function AppLayout({ user, setUser, children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} setUser={setUser} />
      <main>{children}</main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user has an active session
    checkSession()
      .then((res) => {
        if (res.data.loggedIn) {
          setUser(res.data.user);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900">
        <div className="text-white text-center">
          <div className="text-5xl mb-4">🅿️</div>
          <p className="text-xl font-semibold">SmartPark</p>
          <p className="text-blue-300 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} setUser={setUser}>
                <Dashboard user={user} />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} setUser={setUser}>
                <Cars />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking-slots"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} setUser={setUser}>
                <ParkingSlots />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking-records"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} setUser={setUser}>
                <ParkingRecords />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} setUser={setUser}>
                <Payments />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} setUser={setUser}>
                <Reports />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Logout page */}
        <Route
          path="/logout"
          element={
            <ProtectedRoute user={user}>
              <Logout setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
