import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaWallet, 
  FaHistory, 
  FaCopy, 
  FaExchangeAlt,
  FaChartLine,
  FaEthereum
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import WalletActivity from './WalletActivity';
import TokenHoldings from './TokenHoldings';

const AccountDashboard = () => {
  const { currentUser } = useAuth();
  const { account, balance, connectWallet, getTransactionHistory } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [account]);

  const loadDashboardData = async () => {
    try {
      if (account) {
        const history = await getTransactionHistory();
        setTransactions(history);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {/* User Profile Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-16 w-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                <FaUser className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">{currentUser?.displayName}</h2>
                <p className="text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
            {!account ? (
              <button
                onClick={connectWallet}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FaWallet className="-ml-1 mr-2 h-5 w-5" />
                Connect Wallet
              </button>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FaEthereum className="h-6 w-6 text-primary mr-2" />
                  <span className="font-semibold">{balance} ETH</span>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span className="truncate">{account}</span>
                  <button
                    onClick={() => copyToClipboard(account)}
                    className="ml-2 text-primary hover:text-primary-dark"
                  >
                    <FaCopy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'holdings', label: 'Token Holdings', icon: FaWallet },
                { id: 'activity', label: 'Wallet Activity', icon: FaHistory },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === id ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Dashboard Content */}
          <div>
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="bg-primary bg-opacity-10 rounded-full p-3">
                      <FaWallet className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Total Balance</h3>
                      <p className="text-2xl font-semibold text-primary">{balance} ETH</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-3">
                      <FaExchangeAlt className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                      <p className="text-2xl font-semibold text-green-600">
                        {transactions.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3">
                      <FaChartLine className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Portfolio Value</h3>
                      <p className="text-2xl font-semibold text-blue-600">
                        {/* Add portfolio calculation here */}
                        0.00 ETH
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'holdings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TokenHoldings />
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <WalletActivity transactions={transactions} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard; 