import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useToken } from '../contexts/TokenContext';

export const useTokenBuying = () => {
  const { contract, account } = useToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPropertyDetails = useCallback(async (propertyId) => {
    try {
      if (!contract || !propertyId) {
        console.log('Contract or propertyId not available for details');
        return null;
      }

      console.log('Fetching property details for ID:', propertyId);
      
      // Get property details first
      const details = await contract.getPropertyDetails(propertyId);
      console.log('Raw property details:', details);

      if (!details || !details.exists) {
        console.log('Property does not exist');
        return null;
      }

      // Convert BigNumber values and verify they are valid
      const formattedDetails = {
        exists: true,
        supply: details.supply || ethers.constants.Zero,
        pricePerToken: details.pricePerToken || ethers.constants.Zero,
        availableTokens: details.availableTokens || ethers.constants.Zero,
        isTokenized: details.isTokenized
      };

      // Log the formatted details
      console.log('Formatted property details:', {
        exists: formattedDetails.exists,
        supply: formattedDetails.supply.toString(),
        pricePerToken: formattedDetails.pricePerToken.toString(),
        availableTokens: formattedDetails.availableTokens.toString(),
        isTokenized: formattedDetails.isTokenized
      });

      return formattedDetails;
    } catch (err) {
      console.error('Error getting property details:', err);
      return null;
    }
  }, [contract]);

  const getTokenBalance = useCallback(async (address) => {
    try {
      if (!contract || !address) {
        console.log('Contract or address not available for balance check');
        return ethers.constants.Zero;
      }

      const balance = await contract.balanceOf(address);
      console.log('Token balance for', address, ':', balance.toString());
      return balance;
    } catch (err) {
      console.error('Error getting token balance:', err);
      return ethers.constants.Zero;
    }
  }, [contract]);

  const purchaseTokens = useCallback(async (propertyId, amount, price) => {
    try {
      setLoading(true);
      setError(null);

      if (!contract) {
        throw new Error('Contract not initialized');
      }

      if (!account) {
        throw new Error('Please connect your wallet');
      }

      // Verify property is available for purchase
      const details = await getPropertyDetails(propertyId);
      if (!details || !details.isTokenized) {
        throw new Error('Property not available for purchase');
      }

      // Convert amount to Wei
      const amountInWei = ethers.utils.parseEther(amount.toString());
      if (amountInWei.gt(details.availableTokens)) {
        throw new Error('Not enough tokens available for purchase');
      }

      // Calculate total price in Wei
      const priceInWei = ethers.utils.parseEther(price.toString());
      const totalPrice = amountInWei.mul(priceInWei).div(ethers.utils.parseEther('1'));

      console.log('Purchasing tokens:', {
        propertyId,
        amount: amountInWei.toString(),
        price: priceInWei.toString(),
        totalPrice: totalPrice.toString()
      });

      // Send transaction
      const tx = await contract.purchaseTokens(propertyId, amountInWei, {
        value: totalPrice
      });

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      return true;
    } catch (err) {
      console.error('Purchase tokens error:', err);
      setError(err.message || 'Failed to purchase tokens');
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, account, getPropertyDetails]);

  return {
    loading,
    error,
    purchaseTokens,
    getTokenBalance,
    getPropertyDetails
  };
}; 