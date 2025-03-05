import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaChartPie, FaExchangeAlt } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';
import { usePropertyService } from '../../services/propertyService';

const TokenHoldings = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const { getTokenBalance, web3 } = useWeb3();
  const propertyService = usePropertyService();

  useEffect(() => {
    loadHoldings();
  }, []);

  const loadHoldings = async () => {
    try {
      if (!web3) {
        setLoading(false);
        return;
      }

      const tokenizedProperties = await propertyService.getTokenizedProperties();
      const holdingsData = await Promise.all(
        tokenizedProperties.map(async (property) => {
          try {
            const balance = await getTokenBalance(property.id);
            const balanceInEther = web3.utils.fromWei(balance, 'ether');
            const totalSupply = web3.utils.fromWei(property.totalSupply, 'ether');
            const ownership = (parseFloat(balanceInEther) / parseFloat(totalSupply)) * 100;
            const value = (parseFloat(property.price) * parseFloat(balanceInEther)) / parseFloat(totalSupply);
            
            return {
              ...property,
              balance: balanceInEther,
              ownership,
              value: web3.utils.toWei(value.toString(), 'ether')
            };
          } catch (error) {
            console.error(`Error loading holding for property ${property.id}:`, error);
            return null;
          }
        })
      );

      const filteredHoldings = holdingsData.filter(holding => holding && parseFloat(holding.balance) > 0);
      setHoldings(filteredHoldings);
      
      const totalValueWei = filteredHoldings.reduce((sum, holding) => {
        return sum.add(web3.utils.toBN(holding.value));
      }, web3.utils.toBN(0));
      
      setTotalValue(totalValueWei.toString());
    } catch (error) {
      console.error('Error loading holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12">
        <FaChartPie className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Token Holdings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start building your portfolio by purchasing property tokens.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Portfolio Value</h3>
            <p className="text-2xl font-semibold text-primary">
              {web3.utils.fromWei(totalValue.toString(), 'ether')} ETH
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Properties Owned</p>
            <p className="text-xl font-semibold text-gray-900">{holdings.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {holdings.map((holding, index) => (
          <motion.div
            key={holding.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="relative h-48">
              <img
                src={holding.imageUrl}
                alt={holding.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                {holding.ownership.toFixed(2)}% Owned
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <FaBuilding className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{holding.name}</h3>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Token Balance:</span>
                  <span className="font-medium">{holding.balance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Value:</span>
                  <span className="font-medium">
                    {web3.utils.fromWei(holding.value.toString(), 'ether')} ETH
                  </span>
                </div>
              </div>
              <button
                className="w-full flex justify-center items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200"
              >
                <FaExchangeAlt className="mr-2" />
                Trade Tokens
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TokenHoldings; 