import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { usePropertyService } from '../../services/propertyService';
import { useWeb3 } from '../../contexts/Web3Context';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const propertyService = usePropertyService();
  const { mintPropertyToken } = useWeb3();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const propertiesList = await propertyService.getAllProperties();
      setProperties(propertiesList);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (propertyData) => {
    try {
      await propertyService.addProperty(propertyData);
      await loadProperties();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding property:', error);
    }
  };

  const handleMintToken = async (propertyId) => {
    try {
      await mintPropertyToken(propertyId);
      await loadProperties();
    } catch (error) {
      console.error('Error minting token:', error);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <FaPlus className="-ml-1 mr-2 h-5 w-5" />
          Add Property
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {properties.map((property) => (
            <motion.li
              key={property.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                  <p className="text-sm text-gray-500">{property.location}</p>
                  <p className="text-sm text-gray-500">Price: ${property.price}</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleMintToken(property.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={property.isTokenized}
                  >
                    {property.isTokenized ? 'Tokenized' : 'Mint Token'}
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => {/* Handle edit */}}
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                  <button
                    className="text-red-400 hover:text-red-500"
                    onClick={() => {/* Handle delete */}}
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Add Property Modal would go here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          {/* Modal content would go here */}
        </div>
      )}
    </div>
  );
};

export default PropertyManagement; 