import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEthereum, FaUpload } from 'react-icons/fa';
import web3Service from '../../services/web3Service';
import propertyService from '../../services/propertyService';

const TokenizeProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    size: '',
    propertyType: '',
    yearBuilt: '',
    totalValue: '',
    tokenSupply: '',
    tokenPrice: '',
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Initialize Web3
      const isWeb3Ready = await web3Service.initialize();
      if (!isWeb3Ready) {
        throw new Error('Failed to initialize Web3');
      }

      // Create property in Firebase
      const property = await propertyService.createProperty(formData, formData.images);

      // Generate token URI
      const tokenURI = propertyService.generateTokenURI(property);

      // Tokenize property using ERC20
      if (formData.tokenSupply) {
        await web3Service.tokenizeProperty(
          property.id,
          formData.tokenSupply,
          formData.tokenPrice
        );
      }

      // Create NFT if needed
      await web3Service.mintProperty(
        property.id,
        JSON.stringify(tokenURI),
        formData.totalValue
      );

      // Update property status
      await propertyService.updatePropertyStatus(property.id, 'tokenized', {
        tokenSupply: formData.tokenSupply,
        tokenPrice: formData.tokenPrice,
        totalValue: formData.totalValue,
      });

      navigate(`/properties/${property.id}`);
    } catch (error) {
      console.error('Error tokenizing property:', error);
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tokenize Your Property
        </h1>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (sq ft)
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built
              </label>
              <input
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Value (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="totalValue"
                  value={formData.totalValue}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
                <FaEthereum className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Supply
              </label>
              <input
                type="number"
                name="tokenSupply"
                value={formData.tokenSupply}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Price (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="tokenPrice"
                  value={formData.tokenPrice}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
                <FaEthereum className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primaryDark">
                    <span>Upload images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                      required
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Tokenizing Property...' : 'Tokenize Property'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TokenizeProperty; 