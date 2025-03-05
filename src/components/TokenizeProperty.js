import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useToken } from '../contexts/TokenContext';
import { ethers } from 'ethers';

export const TokenizeProperty = ({ property, onSuccess }) => {
  const { contract } = useToken();
  const [totalSupply, setTotalSupply] = useState('');
  const [pricePerToken, setPricePerToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Validate inputs
      if (isNaN(totalSupply) || isNaN(pricePerToken)) {
        throw new Error('Invalid input values');
      }

      console.log('Tokenizing property:', {
        propertyId: property.id,
        totalSupply,
        pricePerToken
      });

      // Call contract method with string values
      const result = await contract.tokenizeProperty(
        property.id,
        totalSupply,
        pricePerToken
      );

      console.log('Tokenization result:', result);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error tokenizing property:', err);
      setError(err.message || 'Failed to tokenize property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group>
        <Form.Label>Total Supply</Form.Label>
        <Form.Control
          type="number"
          value={totalSupply}
          onChange={(e) => setTotalSupply(e.target.value)}
          placeholder="Enter total token supply"
          required
          min="0"
          step="0.000000000000000001"
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Price per Token (ETH)</Form.Label>
        <Form.Control
          type="number"
          value={pricePerToken}
          onChange={(e) => setPricePerToken(e.target.value)}
          placeholder="Enter price per token in ETH"
          required
          min="0"
          step="0.000000000000000001"
        />
      </Form.Group>

      <Button 
        variant="primary" 
        type="submit"
        disabled={loading || !totalSupply || !pricePerToken}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span className="ml-2">Tokenizing...</span>
          </>
        ) : (
          'Tokenize Property'
        )}
      </Button>
    </Form>
  );
}; 