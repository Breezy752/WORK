import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/employees', label: 'Employee' },
    { to: '/departments', label: 'Department' },
    { to: '/salaries', label: 'Salary' },
    { to: '/reports', label: 'Reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{background: '#0a0a0a', borderBottom: '2px solid #f97316'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full" style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-wide text-white">SmartPark <span style={{color: '#f97316'}}>EPMS</span></span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                style={isActive(link.to)
                  ? {background: '#f97316', color: '#ffffff'}
                  : {color: '#d1d5db'}}
                onMouseEnter={e => { if (!isActive(link.to)) { e.target.style.color = '#f97316'; } }}
                onMouseLeave={e => { if (!isActive(link.to)) { e.target.style.color = '#d1d5db'; } }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-sm" style={{color: '#9ca3af'}}>
              Welcome, <span className="font-semibold text-white">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all duration-200"
              style={{background: '#dc2626'}}
              onMouseEnter={e => e.target.style.background = '#b91c1c'}
              onMouseLeave={e => e.target.style.background = '#dc2626'}
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md transition-colors"
            style={{color: '#f97316'}}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1" style={{background: '#111111', borderTop: '1px solid #374151'}}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={isActive(link.to)
                ? {background: '#f97316', color: '#fff'}
                : {color: '#d1d5db'}}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2" style={{borderTop: '1px solid #374151'}}>
            <p className="text-xs mb-2" style={{color: '#6b7280'}}>Logged in as: {user?.username}</p>
            <button
              onClick={handleLogout}
              className="w-full text-white px-3 py-2 rounded-md text-sm font-medium"
              style={{background: '#dc2626'}}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
