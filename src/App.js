import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import MainLayout from './components/layout/MainLayout';
import Hero from './components/home/Hero';
import HowItWorks from './components/home/HowItWorks';
import FeaturedProperties from './components/home/FeaturedProperties';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import TokenizeProperty from './components/tokenization/TokenizeProperty';
import AccountDashboard from './components/account/AccountDashboard';
import PropertyBrowser from './components/property/PropertyBrowser';
import OwnershipTracker from './components/property/OwnershipTracker';
import AdminDashboard from './components/admin/AdminDashboard';
import PropertyManagement from './components/admin/PropertyManagement';
import TransactionLogs from './components/admin/TransactionLogs';
import UserManagement from './components/admin/UserManagement';
import PrivateRoute from './components/auth/PrivateRoute';
import WalletConnect from './components/wallet/WalletConnect';
import TokenTransfer from './components/wallet/TokenTransfer';
import WalletBalance from './components/wallet/WalletBalance';
import NotFound from './components/layout/NotFound';

const HomePage = () => (
  <MainLayout>
    <div className="bg-background">
      <Hero />
      <HowItWorks />
      <FeaturedProperties />
    </div>
  </MainLayout>
);

const DashboardLayout = ({ children }) => (
  <MainLayout>
    <div className="container mx-auto px-4 py-8 bg-background min-h-full">
      {children}
    </div>
  </MainLayout>
);

const WalletPage = () => (
  <div className="space-y-6 bg-white rounded-lg shadow-lg p-6">
    <WalletConnect />
    <WalletBalance />
    <TokenTransfer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Web3Provider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/properties" element={
                <DashboardLayout>
                  <PropertyBrowser />
                </DashboardLayout>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AccountDashboard />
                  </DashboardLayout>
                </PrivateRoute>
              } />

              <Route path="/my-properties" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <OwnershipTracker />
                  </DashboardLayout>
                </PrivateRoute>
              } />

              <Route path="/tokenize" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <TokenizeProperty />
                  </DashboardLayout>
                </PrivateRoute>
              } />

              <Route path="/wallet" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <WalletPage />
                  </DashboardLayout>
                </PrivateRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <PrivateRoute requireAdmin>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="properties" replace />} />
                <Route path="properties" element={<PropertyManagement />} />
                <Route path="transactions" element={<TransactionLogs />} />
                <Route path="users" element={<UserManagement />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </Web3Provider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;