import React, { useState } from 'react';
import { FaUsers, FaBuilding, FaHistory, FaCog, FaChartLine, FaWallet, FaFileContract } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import TransactionLogs from './TransactionLogs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const [activeTab, setActiveTab] = useState(currentPath || 'properties');

  const tabs = [
    { id: 'properties', name: 'Properties', icon: FaBuilding },
    { id: 'users', name: 'Users', icon: FaUsers },
    { id: 'transactions', name: 'Transactions', icon: FaHistory },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/${tabId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'transactions':
        return <TransactionLogs />;
      default:
        return <PropertyManagement />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex-1 px-4 py-4 text-center border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 