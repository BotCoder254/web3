import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEthereum, FaInfoCircle } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';

const BuyTokensModal = ({ property, onClose }) => {
  const [amount, setAmount] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { buyTokens, getTokenPrice, web3 } = useWeb3();

  useEffect(() => {
    calculateTotalCost();
  }, [amount]);

  const calculateTotalCost = async () => {
    if (!amount || isNaN(amount)) {
      setTotalCost(0);
      return;
    }
    try {
      const price = await getTokenPrice(property.id);
      setTotalCost(price * parseFloat(amount));
      setError('');
    } catch (error) {
      console.error('Error calculating cost:', error);
      setError('Error calculating cost. Please try again.');
    }
  };

  const handleBuy = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await buyTokens(property.id, parseFloat(amount));
      onClose();
    } catch (error) {
      console.error('Error buying tokens:', error);
      setError(error.message || 'Error buying tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Buy Property Tokens</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Property Details</h4>
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-sm text-gray-600 mb-2">{property.name}</p>
              <p className="text-sm text-gray-600">{property.location}</p>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tokens
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pr-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaEthereum className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {totalCost > 0 && (
            <div className="mb-6 bg-blue-50 rounded-md p-4">
              <div className="flex items-center">
                <FaInfoCircle className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-sm text-blue-700">
                  Total Cost: {web3.utils.fromWei(totalCost.toString(), 'ether')} ETH
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={loading || !amount}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white 
                ${loading || !amount
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                }`}
            >
              {loading ? 'Processing...' : 'Buy Tokens'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BuyTokensModal; 