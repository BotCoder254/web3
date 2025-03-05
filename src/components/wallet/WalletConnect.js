import React from 'react';
import { motion } from 'framer-motion';
import { FaEthereum, FaWallet } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';

const WalletConnect = () => {
  const { account, loading, error, connectWallet, disconnectWallet } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      {error && (
        <div className="absolute -top-12 left-0 right-0 bg-red-50 text-red-500 p-2 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {account ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
            <FaEthereum className="text-primary mr-2" />
            <span className="text-sm font-medium">{formatAddress(account)}</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Disconnect
          </button>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={connectWallet}
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
        >
          <FaWallet className="mr-2" />
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </motion.button>
      )}
    </div>
  );
};

export default WalletConnect; 