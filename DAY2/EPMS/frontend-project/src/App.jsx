import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Salaries from './pages/Salaries';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/employees" element={
            <ProtectedRoute>
              <Layout><Employees /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/departments" element={
            <ProtectedRoute>
              <Layout><Departments /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/salaries" element={
            <ProtectedRoute>
              <Layout><Salaries /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
