import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RealEstateToken from '../contracts/RealEstateToken.json';
import RealEstateNFT from '../contracts/RealEstateNFT.json';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

const TOKEN_CONTRACT_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// ERC1155 Interface
const ERC1155_INTERFACE = new ethers.utils.Interface([
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function getTokensOfOwner(address owner) view returns (uint256[])'
]);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState('0');

  const getTransactionHistory = async () => {
    if (!provider || !account) return [];

    try {
      // Get the last 100 blocks
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = ethers.utils.hexValue(Math.max(0, currentBlock - 100));

      // Get transfer events
      const singleFilter = {
        address: TOKEN_CONTRACT_ADDRESS,
        topics: [
          ethers.utils.id("TransferSingle(address,address,address,uint256,uint256)"),
          null,
          ethers.utils.hexZeroPad(account, 32),
          null
        ],
        fromBlock,
        toBlock: 'latest'
      };

      const batchFilter = {
        address: TOKEN_CONTRACT_ADDRESS,
        topics: [
          ethers.utils.id("TransferBatch(address,address,address,uint256[],uint256[])"),
          null,
          ethers.utils.hexZeroPad(account, 32),
          null
        ],
        fromBlock,
        toBlock: 'latest'
      };

      const [singleEvents, batchEvents] = await Promise.all([
        provider.getLogs(singleFilter),
        provider.getLogs(batchFilter)
      ]);

      // Process events
      const processedEvents = await Promise.all([
        ...singleEvents.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          const tx = await provider.getTransaction(event.transactionHash);
          const decodedData = tokenContract.interface.decodeEventLog(
            "TransferSingle",
            event.data,
            event.topics
          );
          return {
            type: 'Transfer',
            hash: event.transactionHash,
            timestamp: block.timestamp * 1000,
            from: decodedData.from,
            to: decodedData.to,
            value: decodedData.value.toString(),
            tokenId: decodedData.id.toString()
          };
        }),
        ...batchEvents.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          const tx = await provider.getTransaction(event.transactionHash);
          const decodedData = tokenContract.interface.decodeEventLog(
            "TransferBatch",
            event.data,
            event.topics
          );
          return {
            type: 'BatchTransfer',
            hash: event.transactionHash,
            timestamp: block.timestamp * 1000,
            from: decodedData.from,
            to: decodedData.to,
            values: decodedData.values.map(v => v.toString()),
            tokenIds: decodedData.ids.map(id => id.toString())
          };
        })
      ]);

      return processedEvents.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  };

  const updateBalance = async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this feature');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Switch to the correct network if needed
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = '0x539'; // Chain ID 1337 in hex
      
      if (currentChainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'Localhost 8545',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['http://127.0.0.1:8545'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Initialize provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      setAccount(accounts[0]);
      setIsConnected(true);
      setChainId(targetChainId);
      setError(null);

      console.log('Wallet connected:', {
        account: accounts[0],
        chainId: targetChainId,
        provider: 'MetaMask'
      });
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err.message);
      setIsConnected(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setError(null);
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(provider);
            setAccount(accounts[0]);
            setIsConnected(true);
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(chainId);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(chainId);
        window.location.reload();
      });

      window.ethereum.on('disconnect', () => {
        disconnectWallet();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
        window.ethereum.removeListener('disconnect', () => {});
      }
    };
  }, []);

  // Update balance periodically
  useEffect(() => {
    if (provider && account) {
      const interval = setInterval(updateBalance, 15000); // Every 15 seconds
      return () => clearInterval(interval);
    }
  }, [provider, account]);

  const value = {
    provider,
    account,
    isConnected,
    chainId,
    signer,
    tokenContract,
    nftContract,
    networkId,
    loading,
    error,
    balance,
    connectWallet,
    disconnectWallet,
    getTransactionHistory,
    TOKEN_CONTRACT_ADDRESS,
    NFT_CONTRACT_ADDRESS
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3Context; 