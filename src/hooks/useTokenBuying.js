import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { useToken } from '../contexts/TokenContext';

export const useTokenBuying = () => {
  const { provider, account, isConnected } = useWeb3();
  const { contract } = useToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const amountInWei = ethers.utils.parseEther(amount.toString());
      const priceInWei = ethers.utils.parseEther(price.toString());
      const totalPrice = amountInWei.mul(priceInWei).div(ethers.utils.parseEther('1'));

      console.log('Purchasing tokens:', {
        propertyId,
        amount: amountInWei.toString(),
        totalPrice: totalPrice.toString()
      });

      const tx = await contract.purchaseTokens(propertyId, amountInWei, {
        value: totalPrice,
        from: account
      });

      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed');
      return true;
    } catch (err) {
      console.error('Purchase tokens error:', err);
      setError(err.message || 'Failed to purchase tokens');
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  const getTokenBalance = useCallback(async (address) => {
    try {
      if (!contract || !address) return '0';

      const balance = await contract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error('Error getting token balance:', err);
      return '0';
    }
  }, [contract]);

  const getPropertyDetails = useCallback(async (propertyId) => {
    try {
      if (!contract || !propertyId) {
        console.log('Contract or propertyId not available:', { contract: !!contract, propertyId });
        return null;
      }

      console.log('Fetching property details for ID:', propertyId);
      const details = await contract.getPropertyDetails(propertyId);
      
      const formattedDetails = {
        exists: details.exists,
        supply: ethers.utils.formatEther(details.supply),
        pricePerToken: ethers.utils.formatEther(details.pricePerToken),
        availableTokens: ethers.utils.formatEther(details.availableTokens)
      };
      
      console.log('Property details:', formattedDetails);
      return formattedDetails;
    } catch (err) {
      console.error('Error getting property details:', err);
      return null;
    }
  }, [contract]);

  return {
    loading,
    error,
    purchaseTokens,
    getTokenBalance,
    getPropertyDetails
  };
}; 