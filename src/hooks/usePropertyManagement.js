import { useState, useEffect, useCallback } from 'react';
import { usePropertyService } from '../services/propertyService';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';

export const usePropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const propertyService = usePropertyService();
  const { tokenContract, web3 } = useWeb3();
  const { currentUser } = useAuth();

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const propertiesList = await propertyService.getAllProperties();
      setProperties(propertiesList);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyService]);

  const createProperty = async (propertyData) => {
    try {
      setLoading(true);
      const propertyId = await propertyService.createProperty({
        ...propertyData,
        ownerId: currentUser.uid,
        status: 'pending'
      });
      await loadProperties();
      return propertyId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (id, propertyData) => {
    try {
      setLoading(true);
      await propertyService.updateProperty(id, propertyData);
      await loadProperties();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    try {
      setLoading(true);
      await propertyService.deleteProperty(id);
      await loadProperties();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const tokenizeProperty = async (property) => {
    try {
      setLoading(true);
      if (!tokenContract || !web3) {
        throw new Error('Web3 not initialized');
      }

      const tokenSupply = web3.utils.toWei(property.tokenSupply.toString(), 'ether');
      const tokenPrice = web3.utils.toWei(property.tokenPrice.toString(), 'ether');

      const tx = await tokenContract.methods
        .tokenizeProperty(property.id, tokenSupply, tokenPrice)
        .send({ from: currentUser.uid });

      await propertyService.updatePropertyStatus(property.id, 'tokenized');
      await loadProperties();
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const suspendProperty = async (id) => {
    try {
      setLoading(true);
      await propertyService.updatePropertyStatus(id, 'suspended');
      await loadProperties();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateProperty = async (id) => {
    try {
      setLoading(true);
      await propertyService.updatePropertyStatus(id, 'active');
      await loadProperties();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    tokenizeProperty,
    suspendProperty,
    activateProperty,
    loadProperties
  };
};

export default usePropertyManagement; 