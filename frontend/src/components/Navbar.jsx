import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';

const Navbar = ({ isAuthenticated, onLogout, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <Shield size={28} />
            <span>Cyber Threat Intel</span>
          </Link>

          {isAuthenticated && (
            <div className="flex space-x-6 items-center">
              <Link to="/" className="hover:text-blue-200 transition">Home</Link>
              <Link to="/report" className="hover:text-blue-200 transition">Report Threat</Link>
              <Link to="/scan" className="hover:text-blue-200 transition">Scan</Link>
              <Link to="/phishing" className="hover:text-blue-200 transition">Phishing</Link>
              <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
              <Link to="/global" className="hover:text-blue-200 transition">Global View</Link>
              <Link to="/admin" className="hover:text-blue-200 transition">Admin</Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;