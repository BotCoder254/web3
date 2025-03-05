import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaSpinner } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';

const WalletBalance = ({ propertyId }) => {
  const { account, tokenContract } = useWeb3();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !tokenContract) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const balanceWei = await tokenContract.balanceOf(account);
        setBalance(ethers.utils.formatEther(balanceWei));
        setError('');
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Set up event listener for token transfers
    if (tokenContract) {
      const transferFilter = tokenContract.filters.Transfer(null, account);
      tokenContract.on(transferFilter, fetchBalance);
      
      return () => {
        tokenContract.off(transferFilter, fetchBalance);
      };
    }
  }, [account, tokenContract]);

  if (!account) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FaCoins className="text-primary mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Token Balance</h3>
        </div>
        {loading ? (
          <FaSpinner className="animate-spin text-primary" />
        ) : error ? (
          <span className="text-sm text-red-500">{error}</span>
        ) : (
          <span className="text-lg font-semibold text-gray-900">
            {parseFloat(balance).toFixed(6)}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default WalletBalance; 