import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/cars', label: 'Cars' },
    { to: '/parking-slots', label: 'Parking Slots' },
    { to: '/parking-records', label: 'Records' },
    { to: '/payments', label: 'Payments' },
    { to: '/reports', label: 'Reports' },
  ];

  const active = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold text-lg hover:text-blue-300 transition-colors">
            <span className="bg-white text-blue-900 font-black text-sm px-2 py-0.5 rounded">SP</span>
            <span className="hidden sm:inline">SmartPark</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active(l.to)
                    ? 'bg-white text-blue-900 font-semibold'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden md:inline text-blue-300 text-sm font-medium bg-blue-800 px-3 py-1.5 rounded-lg">
                👤 {user.username}
              </span>
            )}
            <Link
              to="/logout"
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </Link>
            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <span className="block w-5 h-0.5 bg-white rounded"></span>
              <span className="block w-5 h-0.5 bg-white rounded"></span>
              <span className="block w-5 h-0.5 bg-white rounded"></span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-blue-800 py-3 flex flex-col gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active(l.to)
                    ? 'bg-white text-blue-900 font-semibold'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <p className="px-4 py-2 text-blue-400 text-xs border-t border-blue-800 mt-1 pt-3">
                Logged in as <strong>{user.username}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
