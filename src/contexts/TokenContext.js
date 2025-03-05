import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';
import RealEstateToken from '../artifacts/contracts/RealEstateToken.sol/RealEstateToken.json';

const TokenContext = createContext();

// Default contract address if environment variable is not set
const DEFAULT_CONTRACT_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const { provider, account, isConnected } = useWeb3();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const verifyContract = useCallback(async (tokenContract, address) => {
    try {
      const code = await provider.getCode(address);
      console.log('Contract code at address:', code);
      
      if (code === '0x') {
        throw new Error('No bytecode at contract address');
      }

      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      console.log('Contract verified:', { name, symbol, address });
      return true;
    } catch (err) {
      console.error('Contract verification failed:', err);
      return false;
    }
  }, [provider]);

  const initContract = useCallback(async () => {
    if (!provider) {
      console.log('Provider not available');
      return null;
    }

    try {
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      const contractAddress = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS;
      console.log('Attempting contract initialization at:', contractAddress);

      if (!ethers.utils.isAddress(contractAddress)) {
        throw new Error('Invalid contract address format');
      }

      // Create contract instance
      let tokenContract = new ethers.Contract(
        contractAddress,
        RealEstateToken.abi,
        provider
      );

      // Verify deployment with retries
      let isVerified = await verifyContract(tokenContract, contractAddress);
      
      if (!isVerified && retryCount < 3) {
        console.log(`Retry attempt ${retryCount + 1} of 3`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        isVerified = await verifyContract(tokenContract, contractAddress);
        setRetryCount(prev => prev + 1);
      }

      if (!isVerified) {
        throw new Error('Contract verification failed after retries');
      }

      // Connect with signer if available
      if (isConnected) {
        const signer = provider.getSigner();
        tokenContract = tokenContract.connect(signer);
      }

      return tokenContract;
    } catch (err) {
      throw new Error(`Contract initialization failed: ${err.message}`);
    }
  }, [provider, isConnected, verifyContract, retryCount]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        const newContract = await initContract();
        
        if (mounted) {
          if (newContract) {
            console.log('Contract initialized successfully');
            setContract(newContract);
            setError(null);
          } else {
            setContract(null);
            setError('Failed to initialize contract');
          }
        }
      } catch (err) {
        console.error('Contract initialization error:', err);
        if (mounted) {
          setError(err.message);
          setContract(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [initContract]);

  const value = {
    contract,
    loading,
    error,
    account
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}; 