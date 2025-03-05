import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaSearch } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';
import { usePropertyService } from '../../services/propertyService';
import { ethers } from 'ethers';

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { provider, tokenContract, TOKEN_CONTRACT_ADDRESS } = useWeb3();
  const propertyService = usePropertyService();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      if (!provider || !tokenContract || !TOKEN_CONTRACT_ADDRESS) {
        setLoading(false);
        return;
      }

      // Get all properties for reference
      const properties = await propertyService.getAllProperties();
      const propertyMap = new Map(properties.map(p => [p.id, p]));

      // Get transfer events
      const transferFilter = tokenContract.filters.Transfer();
      const transferEvents = await tokenContract.queryFilter(transferFilter, -10000);

      // Get token purchase events
      const purchaseFilter = tokenContract.filters.TokensPurchased();
      const purchaseEvents = await tokenContract.queryFilter(purchaseFilter, -10000);

      // Combine and process events
      const allEvents = [...transferEvents, ...purchaseEvents]
        .sort((a, b) => b.blockNumber - a.blockNumber);

      const processedTransactions = await Promise.all(
        allEvents.map(async (event) => {
          const block = await event.getBlock();
          const timestamp = new Date(block.timestamp * 1000);

          if (event.event === 'Transfer') {
            const property = propertyMap.get(event.args.propertyId?.toString());
            return {
              id: `${event.blockNumber}-${event.transactionIndex}`,
              type: 'Transfer',
              from: event.args.from,
              to: event.args.to,
              amount: ethers.utils.formatEther(event.args.value),
              propertyName: property?.name || 'Unknown Property',
              timestamp,
              hash: event.transactionHash
            };
          } else {
            const property = propertyMap.get(event.args.propertyId?.toString());
            return {
              id: `${event.blockNumber}-${event.transactionIndex}`,
              type: 'Purchase',
              from: ethers.constants.AddressZero,
              to: event.args.buyer,
              amount: ethers.utils.formatEther(event.args.amount),
              propertyName: property?.name || 'Unknown Property',
              timestamp,
              hash: event.transactionHash
            };
          }
        })
      );

      setTransactions(processedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.hash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaExchangeAlt className={`mr-2 ${
                      tx.type === 'Purchase' ? 'text-green-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tx.type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.propertyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.from === ethers.constants.AddressZero ? 'New Purchase' : 
                    `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {`${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.amount} Tokens
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.timestamp.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionLogs; 