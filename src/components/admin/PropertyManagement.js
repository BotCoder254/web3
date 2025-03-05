import React, { useState } from 'react';
import { FaEdit, FaTrash, FaBan, FaCheck, FaPlus, FaImage } from 'react-icons/fa';
import { usePropertyManagement } from '../../hooks/usePropertyManagement';
import AddPropertyModal from './AddPropertyModal';
import { ethers } from 'ethers';

const PropertyManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const {
    properties,
    loading,
    deleteProperty,
    suspendProperty,
    activateProperty,
    tokenizeProperty,
    loadProperties
  } = usePropertyManagement();

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const handleSuspend = async (propertyId, isSuspended) => {
    try {
      if (isSuspended) {
        await activateProperty(propertyId);
      } else {
        await suspendProperty(propertyId);
      }
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const handleTokenize = async (property) => {
    try {
      await tokenizeProperty(property);
    } catch (error) {
      console.error('Error tokenizing property:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    try {
      // If price is in Wei, convert it to ETH
      if (price.toString().length > 18) {
        return ethers.utils.formatEther(price);
      }
      // If price is already in ETH or regular number
      return Number(price).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0';
    }
  };

  const getImageUrl = (property) => {
    if (!property) return '/placeholder-property.jpg';
    if (property.imageUrl) return property.imageUrl;
    if (property.images && property.images.length > 0) return property.images[0];
    if (property.image) return property.image;
    return '/placeholder-property.jpg';
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
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          <FaPlus className="mr-2" />
          Add Property
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (ETH)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={getImageUrl(property)}
                        alt={property.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-property.jpg';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.type}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {property.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${property.status === 'tokenized' ? 'bg-green-100 text-green-800' : 
                      property.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {property.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatPrice(property.price)} ETH
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {!property.isTokenized && property.status !== 'tokenized' && (
                      <button
                        onClick={() => handleTokenize(property)}
                        className="text-primary hover:text-primary-dark"
                        title="Tokenize Property"
                      >
                        Tokenize
                      </button>
                    )}
                    <button
                      onClick={() => handleSuspend(property.id, property.status === 'suspended')}
                      className={`${
                        property.status === 'suspended' ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'
                      }`}
                      title={property.status === 'suspended' ? 'Activate Property' : 'Suspend Property'}
                    >
                      {property.status === 'suspended' ? <FaCheck /> : <FaBan />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowAddModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Property"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Property"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddPropertyModal
          property={selectedProperty}
          onClose={() => {
            setShowAddModal(false);
            setSelectedProperty(null);
          }}
          onSave={loadProperties}
        />
      )}
    </div>
  );
};

export default PropertyManagement; 