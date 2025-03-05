import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const showFooter = isLandingPage && !currentUser;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout; 