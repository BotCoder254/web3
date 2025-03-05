import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useTokenBuying } from '../hooks/useTokenBuying';
import { useWeb3 } from '../contexts/Web3Context';
import { useToken } from '../contexts/TokenContext';
import { ethers } from 'ethers';

export const PropertyCard = ({ property }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const { contract } = useToken();
  const { loading: buyingLoading, error, purchaseTokens, getPropertyDetails, getTokenBalance } = useTokenBuying();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [loadingDetails, setLoadingDetails] = useState(true);

  const loadPropertyDetails = useCallback(async () => {
    if (!contract || !property?.id) {
      console.log('Contract or property ID not available:', { contract: !!contract, propertyId: property?.id });
      setLoadingDetails(false);
      return;
    }

    try {
      setLoadingDetails(true);
      console.log('Loading details for property:', property.id);
      
      // Get property details from contract
      const details = await getPropertyDetails(property.id);
      console.log('Loaded property details:', details);
      
      if (details && details.exists && details.isTokenized && !details.availableTokens.isZero()) {
        setPropertyDetails(details);
        
        // Get user token balance if connected
        if (account) {
          const balance = await getTokenBalance(account);
          console.log('User token balance:', balance);
          setUserBalance(balance);
        }
      } else {
        console.log('Property not available for purchase:', { 
          exists: details?.exists, 
          isTokenized: details?.isTokenized,
          availableTokens: details?.availableTokens?.toString() 
        });
        setPropertyDetails(null);
      }
    } catch (err) {
      console.error('Error loading property details:', err);
      setPropertyDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, [contract, property?.id, account, getPropertyDetails, getTokenBalance]);

  // Load property details when contract or property changes
  useEffect(() => {
    loadPropertyDetails();
  }, [loadPropertyDetails, contract, property?.id]);

  // Reload details when account changes
  useEffect(() => {
    if (account) {
      loadPropertyDetails();
    }
  }, [account, loadPropertyDetails]);

  const handlePurchase = async () => {
    if (!purchaseAmount || !propertyDetails) return;

    try {
      const amount = ethers.utils.parseEther(purchaseAmount);
      if (amount.gt(propertyDetails.availableTokens)) {
        throw new Error('Purchase amount exceeds available tokens');
      }

      console.log('Attempting purchase:', {
        propertyId: property.id,
        amount: purchaseAmount,
        price: ethers.utils.formatEther(propertyDetails.pricePerToken)
      });

      const success = await purchaseTokens(
        property.id,
        purchaseAmount,
        ethers.utils.formatEther(propertyDetails.pricePerToken)
      );

      if (success) {
        setShowPurchaseModal(false);
        setPurchaseAmount('');
        await loadPropertyDetails(); // Reload details after purchase
      }
    } catch (err) {
      console.error('Error during purchase:', err);
    }
  };

  const handleConnectOrPurchase = () => {
    if (!isConnected) {
      connectWallet();
    } else {
      setShowPurchaseModal(true);
    }
  };

  const formatTokens = (value) => {
    try {
      return ethers.utils.formatEther(value.toString());
    } catch (err) {
      console.error('Error formatting tokens:', err);
      return '0';
    }
  };

  const calculateTotalCost = (amount) => {
    if (!amount || !propertyDetails) return '0';
    try {
      const tokenAmount = ethers.utils.parseEther(amount);
      const totalCost = tokenAmount.mul(propertyDetails.pricePerToken).div(ethers.utils.parseEther('1'));
      return ethers.utils.formatEther(totalCost);
    } catch (err) {
      console.error('Error calculating total cost:', err);
      return '0';
    }
  };

  const isValidPurchaseAmount = (amount) => {
    if (!amount || !propertyDetails) return false;
    try {
      const tokenAmount = ethers.utils.parseEther(amount);
      return tokenAmount.gt(0) && tokenAmount.lte(propertyDetails.availableTokens);
    } catch {
      return false;
    }
  };

  return (
    <Card className="property-card">
      <Card.Img variant="top" src={property.image} />
      <Card.Body>
        <Card.Title>{property.name}</Card.Title>
        <Card.Text>{property.description}</Card.Text>
        <Card.Text>Location: {property.location}</Card.Text>
        <Card.Text>Price: {property.price} ETH</Card.Text>
        
        {loadingDetails ? (
          <div className="text-center">
            <Spinner animation="border" size="sm" />
            <span className="ml-2">Loading property details...</span>
          </div>
        ) : propertyDetails ? (
          <>
            <Card.Text>Available Tokens: {formatTokens(propertyDetails.availableTokens)}</Card.Text>
            <Card.Text>Token Price: {formatTokens(propertyDetails.pricePerToken)} ETH</Card.Text>
            {isConnected && <Card.Text>Your Balance: {formatTokens(userBalance)} Tokens</Card.Text>}
          </>
        ) : (
          <Card.Text>Property not available for purchase</Card.Text>
        )}

        <Button 
          variant="primary" 
          onClick={handleConnectOrPurchase}
          disabled={buyingLoading || (isConnected && !propertyDetails)}
        >
          {!isConnected ? 'Connect Wallet to Purchase' : 
           buyingLoading ? <Spinner animation="border" size="sm" /> : 
           'Purchase Tokens'}
        </Button>
      </Card.Body>

      <Modal show={showPurchaseModal} onHide={() => setShowPurchaseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Tokens</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group>
              <Form.Label>Amount of Tokens</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                min="0"
                max={propertyDetails ? formatTokens(propertyDetails.availableTokens) : '0'}
                step="0.000000000000000001"
              />
            </Form.Group>
            {propertyDetails && purchaseAmount && (
              <p className="mt-3">
                Total Cost: {calculateTotalCost(purchaseAmount)} ETH
              </p>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPurchaseModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={!isValidPurchaseAmount(purchaseAmount) || buyingLoading}
          >
            {buyingLoading ? <Spinner animation="border" size="sm" /> : 'Confirm Purchase'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}; 