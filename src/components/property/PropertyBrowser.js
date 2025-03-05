import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaDollarSign, FaMapMarkerAlt, FaEthereum, FaRuler, FaCalendar, FaHome, FaCoins } from 'react-icons/fa';
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
      // Process properties to ensure all required fields
      const processedProperties = propertiesList.map(property => ({
        ...property,
        price: property.price || property.tokenPrice || '0',
        imageUrl: property.imageUrl || property.images?.[0] || '/placeholder-property.jpg',
        isTokenized: Boolean(property.isTokenized),
        status: property.status || (property.isTokenized ? 'tokenized' : 'pending')
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
    if (!property?.isTokenized) {
      console.info('Property not yet tokenized');
      return;
    }
    if (!property?.price) {
      console.error('Invalid property or price not set');
      return;
    }
    setSelectedProperty(property);
    setShowBuyModal(true);
  };

  const getPropertyStatus = (property) => {
    if (property.isTokenized) return 'Buy Tokens';
    if (property.status === 'pending') return 'Coming Soon';
    return 'Not Available';
  };

  const getStatusColor = (property) => {
    if (property.isTokenized) return 'bg-green-500';
    if (property.status === 'pending') return 'bg-yellow-500';
    return 'bg-gray-500';
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-property.jpg';
                    }}
                  />
                  <div className="absolute top-0 right-0 p-2 space-y-1">
                    {property.isTokenized && (
                      <div className={`px-2 py-1 ${getStatusColor(property)} text-white text-xs rounded-full`}>
                        {property.status === 'tokenized' ? 'Tokenized' : 'Pending'}
                      </div>
                    )}
                    {property.featured && (
                      <div className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                        Featured
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                    <div className="text-right">
                      <div className="text-primary font-bold">
                        <FaDollarSign className="inline-block mr-1" />
                        {Number(property.price).toLocaleString()}
                      </div>
                      {property.tokenPrice && (
                        <div className="text-sm text-gray-600">
                          <FaEthereum className="inline-block mr-1" />
                          {Number(property.tokenPrice).toLocaleString()} /token
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{property.location}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      {property.size && (
                        <div className="flex items-center">
                          <FaRuler className="mr-2" />
                          <span>{Number(property.size).toLocaleString()} sq ft</span>
                        </div>
                      )}
                      {property.yearBuilt && (
                        <div className="flex items-center">
                          <FaCalendar className="mr-2" />
                          <span>Built {property.yearBuilt}</span>
                        </div>
                      )}
                      {property.propertyType && (
                        <div className="flex items-center">
                          <FaHome className="mr-2" />
                          <span>{property.propertyType}</span>
                        </div>
                      )}
                      {property.tokenSupply && (
                        <div className="flex items-center">
                          <FaCoins className="mr-2" />
                          <span>{Number(property.tokenSupply).toLocaleString()} tokens</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </div>

                  <button
                    onClick={() => handleBuyTokens(property)}
                    className={`w-full ${
                      property.isTokenized 
                        ? 'bg-primary hover:bg-primary-dark' 
                        : 'bg-gray-400 cursor-not-allowed'
                    } text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200`}
                    disabled={!property.isTokenized}
                  >
                    {getPropertyStatus(property)}
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