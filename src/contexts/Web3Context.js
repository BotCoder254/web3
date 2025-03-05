import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RealEstateToken from '../contracts/RealEstateToken.json';
import RealEstateNFT from '../contracts/RealEstateNFT.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

const TOKEN_CONTRACT_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this feature');
      }

      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      // Initialize contracts with fallback addresses
      const tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        RealEstateToken.abi,
        signer
      );

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        RealEstateNFT.abi,
        signer
      );

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setTokenContract(tokenContract);
      setNftContract(nftContract);
      setNetworkId(network.chainId);
      setError(null);
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message);
      // Reset contracts on error
      setTokenContract(null);
      setNftContract(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setTokenContract(null);
    setNftContract(null);
    setNetworkId(null);
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connectWallet();
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          console.error('Error checking wallet connection:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    tokenContract,
    nftContract,
    networkId,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    TOKEN_CONTRACT_ADDRESS,
    NFT_CONTRACT_ADDRESS
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3Context; 