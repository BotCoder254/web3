import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';

const WalletActivity = ({ transactions }) => {
  const { getExplorerUrl } = useWeb3();

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTransactionTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'send':
        return 'text-red-600 bg-red-100';
      case 'receive':
        return 'text-green-600 bg-green-100';
      case 'mint':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx, index) => (
              <motion.tr
                key={tx.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeColor(tx.type)}`}>
                    {tx.type === 'send' ? (
                      <FaArrowRight className="mr-1 h-4 w-4" />
                    ) : (
                      <FaArrowLeft className="mr-1 h-4 w-4" />
                    )}
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatAddress(tx.from)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatAddress(tx.to)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'send' ? '-' : '+'}
                      {tx.amount} ETH
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(tx.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a
                    href={getExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark"
                  >
                    <FaExternalLinkAlt className="h-5 w-5" />
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletActivity; 