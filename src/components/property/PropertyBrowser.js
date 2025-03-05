import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';
import { usePropertyService } from '../../services/propertyService';
import BuyTokensModal from './BuyTokensModal';

const PropertyBrowser = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceRange: 'all',
    location: 'all',
    tokenized: 'all'
  });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const propertyService = usePropertyService();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const propertiesList = await propertyService.getAllProperties();
      // Ensure all properties have a price value
      const processedProperties = propertiesList.map(property => ({
        ...property,
        price: property.price || property.tokenPrice || '0'
      }));
      setProperties(processedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTokens = (property) => {
    if (!property || !property.price) {
      console.error('Invalid property or price not set');
      return;
    }
    setSelectedProperty(property);
    setShowBuyModal(true);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriceRange = filters.priceRange === 'all' ||
      (filters.priceRange === 'under1m' && property.price < 1000000) ||
      (filters.priceRange === '1m-5m' && property.price >= 1000000 && property.price <= 5000000) ||
      (filters.priceRange === 'over5m' && property.price > 5000000);

    const matchesLocation = filters.location === 'all' || property.location === filters.location;
    const matchesTokenized = filters.tokenized === 'all' ||
      (filters.tokenized === 'yes' && property.isTokenized) ||
      (filters.tokenized === 'no' && !property.isTokenized);

    return matchesSearch && matchesPriceRange && matchesLocation && matchesTokenized;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-2xl font-bold text-gray-900">Property Browser</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="under1m">Under $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="over5m">Over $5M</option>
              </select>
              <select
                value={filters.tokenized}
                onChange={(e) => setFilters({ ...filters, tokenized: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Properties</option>
                <option value="yes">Tokenized</option>
                <option value="no">Not Tokenized</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative h-48">
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  {property.isTokenized && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      Tokenized
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <FaDollarSign className="mr-2" />
                    <span>{property.price.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleBuyTokens(property)}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={!property.isTokenized}
                  >
                    {property.isTokenized ? 'Buy Tokens' : 'Coming Soon'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {showBuyModal && selectedProperty && (
        <BuyTokensModal
          property={selectedProperty}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  );
};

export default PropertyBrowser; 