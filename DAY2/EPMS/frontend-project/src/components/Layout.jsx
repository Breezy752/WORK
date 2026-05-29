import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{background: '#0f0f0f', color: '#f3f4f6'}}>
      <Navbar />
      <main className="py-6">
        {children}
      </main>
      <footer className="text-center text-xs py-4" style={{background: '#0a0a0a', borderTop: '1px solid #f97316', color: '#6b7280'}}>
        © 2025 <span style={{color: '#f97316'}}>SmartPark EPMS</span>
      </footer>
    </div>
  );
};

export default Layout;
