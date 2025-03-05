import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-primary">
                  RealTokens Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FaHome className="h-5 w-5" />
              </Link>
              <Link
                to="/admin/settings"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FaCog className="h-5 w-5" />
              </Link>
              <button
                onClick={signOut}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FaSignOutAlt className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white shadow-sm mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} RealTokens. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout; 