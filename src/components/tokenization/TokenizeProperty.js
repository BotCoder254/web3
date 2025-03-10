import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEthereum, FaUpload, FaTimes } from 'react-icons/fa';
import web3Service from '../../services/web3Service';
import propertyService from '../../services/propertyService';

const TokenizeProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
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

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // Clean up previews when component unmounts
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, []);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Tokenize Property</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
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

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Property Images
            </label>
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-primary">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <FaUpload className="text-gray-400" size={24} />
              </label>
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
              className={`w-full bg-primary text-white py-3 px-4 rounded-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
              }`}
            >
              {loading ? 'Processing...' : 'Tokenize Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TokenizeProperty; 