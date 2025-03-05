import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWallet, FaHome, FaBuilding, FaExchangeAlt, FaUserCog, FaChartLine, FaList, FaKey } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';

const Navbar = () => {
  const { currentUser, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isActive(to)
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:text-primary hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-primary text-2xl font-bold"
            >
              TokenEstate
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" icon={FaHome}>Home</NavLink>
            <NavLink to="/properties" icon={FaBuilding}>Properties</NavLink>
            
            {currentUser && (
              <>
                <NavLink to="/dashboard" icon={FaChartLine}>Dashboard</NavLink>
                <NavLink to="/my-properties" icon={FaList}>My Properties</NavLink>
                <NavLink to="/wallet" icon={FaWallet}>Wallet</NavLink>
                <NavLink to="/tokenize" icon={FaExchangeAlt}>Tokenize</NavLink>
                
                {isAdmin && (
                  <NavLink to="/admin" icon={FaUserCog}>Admin</NavLink>
                )}
              </>
            )}
            
            {currentUser ? (
              <button
                onClick={signOut}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-primary hover:text-primaryDark"
                >
                  <FaKey className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4"
          >
            <NavLink to="/" icon={FaHome}>Home</NavLink>
            <NavLink to="/properties" icon={FaBuilding}>Properties</NavLink>
            
            {currentUser && (
              <>
                <NavLink to="/dashboard" icon={FaChartLine}>Dashboard</NavLink>
                <NavLink to="/my-properties" icon={FaList}>My Properties</NavLink>
                <NavLink to="/wallet" icon={FaWallet}>Wallet</NavLink>
                <NavLink to="/tokenize" icon={FaExchangeAlt}>Tokenize</NavLink>
                
                {isAdmin && (
                  <NavLink to="/admin" icon={FaUserCog}>Admin</NavLink>
                )}
                
                <button
                  onClick={signOut}
                  className="w-full text-left py-2 text-primary hover:text-primaryDark"
                >
                  Sign Out
                </button>
              </>
            )}
            
            {!currentUser && (
              <>
                <Link to="/login" className="block py-2 text-primary hover:text-primaryDark">
                  Login
                </Link>
                <Link to="/signup" className="block py-2 text-primary hover:text-primaryDark">
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 