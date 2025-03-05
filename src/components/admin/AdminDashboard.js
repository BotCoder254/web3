import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaHistory, FaUsers } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import PropertyManagement from './PropertyManagement';
import TransactionLogs from './TransactionLogs';
import UserManagement from './UserManagement';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('properties');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'properties', label: 'Properties', icon: FaBuilding },
    { id: 'transactions', label: 'Transactions', icon: FaHistory },
    { id: 'users', label: 'Users', icon: FaUsers },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex-1 px-4 py-4 text-center border-b-2 font-medium text-sm
                    ${
                      activeTab === id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="mx-auto h-5 w-5 mb-1" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'properties' && <PropertyManagement />}
            {activeTab === 'transactions' && <TransactionLogs />}
            {activeTab === 'users' && <UserManagement />}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 