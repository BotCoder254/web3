import Web3 from 'web3';
import RealEstateToken from '../contracts/RealEstateToken.json';
import RealEstateNFT from '../contracts/RealEstateNFT.json';
import { ethers } from 'ethers';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.tokenContract = null;
    this.nftContract = null;
    this.account = null;
  }

  async initialize() {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.web3 = new Web3(window.ethereum);
        
        // Get the current account
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];

        // Initialize contracts with proper ABI handling
        const tokenAbi = RealEstateToken.abi.filter(item => item.type !== 'error');
        this.tokenContract = new this.web3.eth.Contract(
          tokenAbi,
          process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS,
          {
            from: this.account,
            gas: '1000000'
          }
        );

        this.nftContract = new this.web3.eth.Contract(
          RealEstateNFT.abi,
          process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
          {
            from: this.account,
            gas: '1000000'
          }
        );

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          this.account = accounts[0];
        });

        return true;
      } catch (error) {
        console.error('Error initializing Web3:', error);
        return false;
      }
    } else {
      console.error('Please install MetaMask!');
      return false;
    }
  }

  // ERC20 Token Methods
  async tokenizeProperty(propertyId, totalSupply, price) {
    try {
      // Ensure the contract is initialized
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }

      // Convert propertyId to a numeric hash that fits in uint256
      const propertyIdNum = Web3.utils.hexToNumber(
        Web3.utils.keccak256(propertyId).slice(0, 10)
      );

      // Convert values to proper uint256 format with safety checks
      const safePropertyId = Web3.utils.toBN(propertyIdNum).toString();
      const safeTotalSupply = Web3.utils.toBN(totalSupply).toString();
      const safePrice = Web3.utils.toBN(
        Web3.utils.toWei(price.toString(), 'ether')
      ).toString();

      // Call the contract method with proper Web3 formatting
      return await this.tokenContract.methods
        .tokenizeProperty(safePropertyId, safeTotalSupply, safePrice)
        .send({ 
          from: this.account,
          gas: '300000'
        });
    } catch (error) {
      console.error('Error tokenizing property:', error);
      throw error;
    }
  }

  async purchaseTokens(propertyId, amount, options = {}) {
    try {
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }

      // Ensure propertyId is properly formatted
      const propertyIdNum = Web3.utils.hexToNumber(
        Web3.utils.keccak256(propertyId.toString()).slice(0, 10)
      );

      // Call the contract method with proper parameters
      return await this.tokenContract.methods
        .purchaseTokens(propertyIdNum.toString(), amount)
        .send({
          from: this.account,
          value: options.value || '0',
          gas: '300000',
          ...options
        });
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw error;
    }
  }

  async getPropertyTokenBalance(propertyId, address) {
    try {
      return await this.tokenContract.methods
        .getPropertyTokenBalance(propertyId, address)
        .call();
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  // NFT Methods
  async mintProperty(propertyId, tokenURI, price) {
    try {
      return await this.nftContract.methods
        .mintProperty(propertyId, tokenURI, price)
        .send({ from: this.account });
    } catch (error) {
      console.error('Error minting property NFT:', error);
      throw error;
    }
  }

  async purchaseProperty(tokenId, price) {
    try {
      return await this.nftContract.methods
        .purchaseProperty(tokenId)
        .send({ from: this.account, value: price });
    } catch (error) {
      console.error('Error purchasing property NFT:', error);
      throw error;
    }
  }

  async setPropertyForSale(tokenId, price) {
    try {
      return await this.nftContract.methods
        .setPropertyForSale(tokenId, price)
        .send({ from: this.account });
    } catch (error) {
      console.error('Error setting property for sale:', error);
      throw error;
    }
  }

  async getPropertyMetadata(tokenId) {
    try {
      return await this.nftContract.methods
        .getPropertyMetadata(tokenId)
        .call();
    } catch (error) {
      console.error('Error getting property metadata:', error);
      throw error;
    }
  }
}

export default new Web3Service(); 