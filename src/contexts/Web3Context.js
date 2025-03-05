import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RealEstateToken from '../contracts/RealEstateToken.json';
import RealEstateNFT from '../contracts/RealEstateNFT.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

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
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
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

      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      // Initialize contracts with ERC1155 interface
      const tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        [...ERC1155_INTERFACE.fragments, ...RealEstateToken.abi],
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

      // Update balance after connecting
      await updateBalance();
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
    setBalance('0');
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      await updateBalance();
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

  // Update balance periodically
  useEffect(() => {
    if (provider && account) {
      const interval = setInterval(updateBalance, 15000); // Every 15 seconds
      return () => clearInterval(interval);
    }
  }, [provider, account]);

  const value = {
    account,
    provider,
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