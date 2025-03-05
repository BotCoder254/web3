import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaUsers, FaCoins } from 'react-icons/fa';

const properties = [
  {
    id: 1,
    title: 'Luxury Apartment Complex',
    location: 'Downtown Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3',
    price: '$25,000,000',
    tokenPrice: '$100',
    availableTokens: '250,000',
    investors: '1,234',
    returns: '10.5%',
  },
  {
    id: 2,
    title: 'Commercial Office Building',
    location: 'Silicon Valley, CA',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3',
    price: '$40,000,000',
    tokenPrice: '$150',
    availableTokens: '300,000',
    investors: '2,156',
    returns: '12.8%',
  },
  {
    id: 3,
    title: 'Retail Shopping Center',
    location: 'Miami Beach, FL',
    image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?ixlib=rb-4.0.3',
    price: '$30,000,000',
    tokenPrice: '$120',
    availableTokens: '275,000',
    investors: '1,876',
    returns: '11.2%',
  },
];

const PropertyCard = ({ property, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
          {property.returns} APY
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {property.title}
        </h3>
        <div className="flex items-center text-gray-600 mb-4">
          <FaMapMarkerAlt className="mr-2" />
          {property.location}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Property Value</p>
            <p className="text-lg font-semibold text-gray-900">{property.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Token Price</p>
            <p className="text-lg font-semibold text-gray-900">
              {property.tokenPrice}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <FaCoins className="mr-2" />
            {property.availableTokens} tokens available
          </div>
          <div className="flex items-center">
            <FaUsers className="mr-2" />
            {property.investors} investors
          </div>
        </div>

        <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryDark transition-colors">
          Invest Now
        </button>
      </div>
    </motion.div>
  );
};

const FeaturedProperties = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Featured Properties
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Discover our handpicked selection of premium real estate investment
            opportunities
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
            View All Properties
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProperties; 