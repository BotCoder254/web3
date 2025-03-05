import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEthereum, FaExchangeAlt, FaUserAlt } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const TokenTransfer = ({ propertyId }) => {
  const { account, tokenContract, loading: web3Loading } = useWeb3();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!account || !tokenContract) {
      setError('Please connect your wallet first');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate recipient address
      if (!ethers.utils.isAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }

      // Convert amount to wei
      const tokenAmount = ethers.utils.parseEther(amount);

      // Check balance
      const balance = await tokenContract.balanceOf(account);
      if (balance.lt(tokenAmount)) {
        throw new Error('Insufficient token balance');
      }

      // Send transaction
      const tx = await tokenContract.transfer(recipient, tokenAmount);
      await tx.wait();

      // Update Firebase records
      const propertyRef = doc(db, 'properties', propertyId);
      const propertyDoc = await getDoc(propertyRef);
      
      if (propertyDoc.exists()) {
        const propertyData = propertyDoc.data();
        const investors = propertyData.investors || {};
        
        // Update sender's balance
        if (investors[account]) {
          investors[account] = ethers.utils.formatEther(
            ethers.utils.parseEther(investors[account].toString())
              .sub(tokenAmount)
          );
        }
        
        // Update recipient's balance
        investors[recipient] = ethers.utils.formatEther(
          ethers.utils.parseEther((investors[recipient] || '0').toString())
            .add(tokenAmount)
        );

        await updateDoc(propertyRef, { investors });
      }

      setSuccess('Transfer completed successfully!');
      setAmount('');
      setRecipient('');
    } catch (error) {
      console.error('Transfer error:', error);
      setError(error.message || 'Failed to transfer tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaExchangeAlt className="mr-2 text-primary" />
        Transfer Tokens
      </h3>

      <form onSubmit={handleTransfer} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUserAlt className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter recipient's wallet address"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEthereum className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter amount to transfer"
              step="0.000001"
              min="0"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || web3Loading || !account}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Transfer Tokens'}
        </button>
      </form>
    </motion.div>
  );
};

export default TokenTransfer; 