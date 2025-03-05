import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartPie, FaEthereum, FaExchangeAlt } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';
import { usePropertyService } from '../../services/propertyService';
import { useAuth } from '../../contexts/AuthContext';
import { ethers } from 'ethers';

const OwnershipTracker = () => {
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const { provider, account, tokenContract } = useWeb3();
  const propertyService = usePropertyService();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && provider && account) {
      loadOwnedProperties();
    }
  }, [currentUser, provider, account]);

  const loadOwnedProperties = async () => {
    try {
      if (!tokenContract || !account) return;

      const ownedTokens = await tokenContract.getTokensOfOwner(account);
      const properties = await Promise.all(
        ownedTokens.map(async (tokenId) => {
          const property = await propertyService.getPropertyById(tokenId.toString());
          const balance = await tokenContract.balanceOf(account, tokenId);
          const totalSupply = await tokenContract.totalSupply(tokenId);
          const value = property.price.mul(balance).div(totalSupply);
          
          return {
            ...property,
            tokenBalance: balance.toString(),
            ownership: (Number(balance) / Number(totalSupply)) * 100,
            value: value.toString()
          };
        })
      );

      setOwnedProperties(properties);
      const total = properties.reduce((sum, prop) => sum.add(ethers.BigNumber.from(prop.value)), ethers.BigNumber.from(0));
      setTotalValue(total.toString());
    } catch (error) {
      console.error('Error loading owned properties:', error);
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

  if (!provider || !account) {
    return (
      <div className="text-center py-12">
        <FaChartPie className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Wallet Not Connected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please connect your wallet to view your properties.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Property Portfolio</h2>
            <div className="mt-4 sm:mt-0 bg-primary bg-opacity-10 rounded-lg px-4 py-2">
              <div className="flex items-center">
                <FaEthereum className="h-5 w-5 text-primary mr-2" />
                <span className="text-primary font-semibold">
                  Total Value: {ethers.utils.formatEther(totalValue)} ETH
                </span>
              </div>
            </div>
          </div>

          {ownedProperties.length === 0 ? (
            <div className="text-center py-12">
              <FaChartPie className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Properties Owned</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start your real estate journey by purchasing property tokens.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedProperties.map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="relative h-48">
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                      {property.ownership.toFixed(2)}% Owned
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Token Balance:</span>
                        <span className="font-medium">{property.tokenBalance}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Value:</span>
                        <span className="font-medium">
                          {ethers.utils.formatEther(property.value)} ETH
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        className="w-full flex justify-center items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200"
                      >
                        <FaExchangeAlt className="mr-2" />
                        Trade Tokens
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnershipTracker; 