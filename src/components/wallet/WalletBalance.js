import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaSpinner } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';

const WalletBalance = ({ propertyId }) => {
  const { account, tokenContract, TOKEN_CONTRACT_ADDRESS, provider } = useWeb3();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !tokenContract || !TOKEN_CONTRACT_ADDRESS || 
          TOKEN_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // If propertyId is provided, fetch balance for specific token
        if (propertyId) {
          const tokenBalance = await tokenContract.balanceOf(account, propertyId);
          setBalance(tokenBalance.toString());
        } else {
          // Fetch total balance across all tokens
          const tokens = await tokenContract.getTokensOfOwner(account);
          let totalBalance = ethers.BigNumber.from(0);

          await Promise.all(tokens.map(async (tokenId) => {
            try {
              const tokenBalance = await tokenContract.balanceOf(account, tokenId);
              totalBalance = totalBalance.add(tokenBalance);
            } catch (err) {
              console.error(`Error fetching balance for token ${tokenId}:`, err);
            }
          }));

          setBalance(totalBalance.toString());
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Failed to fetch balance');
        setBalance('0');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Set up event listeners
    if (tokenContract && account) {
      try {
        // Create event filters
        const singleTransferTopic = tokenContract.interface.getEventTopic('TransferSingle');
        const batchTransferTopic = tokenContract.interface.getEventTopic('TransferBatch');
        
        // Create base filter
        const baseFilter = {
          address: TOKEN_CONTRACT_ADDRESS,
          topics: [
            null, // Event signature (will be filled in for each type)
            null, // operator (any)
            null, // from (any)
            ethers.utils.hexZeroPad(account, 32) // to (specific account)
          ]
        };

        // Create specific filters
        const singleFilter = {
          ...baseFilter,
          topics: [
            singleTransferTopic,
            null,
            null,
            ethers.utils.hexZeroPad(account, 32)
          ]
        };

        const batchFilter = {
          ...baseFilter,
          topics: [
            batchTransferTopic,
            null,
            null,
            ethers.utils.hexZeroPad(account, 32)
          ]
        };

        // Add propertyId to single transfer filter if specified
        if (propertyId) {
          singleFilter.topics.push(ethers.utils.hexZeroPad(ethers.BigNumber.from(propertyId).toHexString(), 32));
        }

        const handleTransfer = () => {
          fetchBalance();
        };

        // Listen for both types of transfers
        provider.on(singleFilter, handleTransfer);
        provider.on(batchFilter, handleTransfer);

        return () => {
          provider.off(singleFilter, handleTransfer);
          provider.off(batchFilter, handleTransfer);
        };
      } catch (err) {
        console.error('Error setting up event listeners:', err);
        // Fallback to polling
        const intervalId = setInterval(fetchBalance, 15000);
        return () => clearInterval(intervalId);
      }
    }
  }, [account, tokenContract, propertyId, TOKEN_CONTRACT_ADDRESS, provider]);

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
            {ethers.utils.formatEther(balance || '0')}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default WalletBalance; 