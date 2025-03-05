import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useTokenBuying } from '../hooks/useTokenBuying';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

export const PropertyCard = ({ property }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const { loading, error, purchaseTokens, getPropertyDetails, getTokenBalance } = useTokenBuying();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      if (!property?.id) {
        console.log('No property ID available');
        setLoadingDetails(false);
        return;
      }

      try {
        setLoadingDetails(true);
        console.log('Loading details for property:', property.id);
        const details = await getPropertyDetails(property.id);
        console.log('Loaded property details:', details);
        setPropertyDetails(details);

        if (account) {
          const balance = await getTokenBalance(account);
          console.log('User token balance:', balance);
          setUserBalance(balance);
        }
      } catch (err) {
        console.error('Error loading property details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [property?.id, account, getPropertyDetails, getTokenBalance]);

  const handlePurchase = async () => {
    if (!purchaseAmount || !propertyDetails) return;

    try {
      const success = await purchaseTokens(
        property.id,
        purchaseAmount,
        propertyDetails.pricePerToken
      );

      if (success) {
        setShowPurchaseModal(false);
        // Refresh property details and user balance
        const details = await getPropertyDetails(property.id);
        setPropertyDetails(details);
        if (account) {
          const balance = await getTokenBalance(account);
          setUserBalance(balance);
        }
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
            <Card.Text>Available Tokens: {propertyDetails.availableTokens}</Card.Text>
            <Card.Text>Token Price: {propertyDetails.pricePerToken} ETH</Card.Text>
            {isConnected && <Card.Text>Your Balance: {userBalance} Tokens</Card.Text>}
          </>
        ) : (
          <Card.Text>Property details not available</Card.Text>
        )}

        <Button 
          variant="primary" 
          onClick={handleConnectOrPurchase}
          disabled={loading || (isConnected && !propertyDetails)}
        >
          {!isConnected ? 'Connect Wallet to Purchase' : 
           loading ? <Spinner animation="border" size="sm" /> : 
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
                max={propertyDetails?.availableTokens || 0}
              />
            </Form.Group>
            {propertyDetails && purchaseAmount && (
              <p className="mt-3">
                Total Cost: {(Number(purchaseAmount) * Number(propertyDetails.pricePerToken)).toFixed(8)} ETH
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
            disabled={!purchaseAmount || loading || !propertyDetails}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Confirm Purchase'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}; 