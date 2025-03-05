import Web3 from 'web3';
import RealEstateToken from '../contracts/RealEstateToken.json';
import RealEstateNFT from '../contracts/RealEstateNFT.json';

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

        // Initialize contracts
        this.tokenContract = new this.web3.eth.Contract(
          RealEstateToken.abi,
          process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS
        );

        this.nftContract = new this.web3.eth.Contract(
          RealEstateNFT.abi,
          process.env.REACT_APP_NFT_CONTRACT_ADDRESS
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
      return await this.tokenContract.methods
        .tokenizeProperty(propertyId, totalSupply, price)
        .send({ from: this.account });
    } catch (error) {
      console.error('Error tokenizing property:', error);
      throw error;
    }
  }

  async purchaseTokens(propertyId, amount, price) {
    try {
      const totalCost = amount * price;
      return await this.tokenContract.methods
        .purchaseTokens(propertyId, amount)
        .send({ from: this.account, value: totalCost });
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