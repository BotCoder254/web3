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

        // Get network and ensure we're connected
        const networkId = await this.web3.eth.net.getId();
        const networkType = await this.web3.eth.net.getNetworkType();
        console.log('Connected to network:', { networkId, networkType });

        // Get and verify contract addresses
        const tokenAddress = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS;
        
        if (!tokenAddress || !this.web3.utils.isAddress(tokenAddress)) {
          throw new Error('Invalid token contract address');
        }

        // Check if contract is deployed
        const code = await this.web3.eth.getCode(tokenAddress);
        if (code === '0x' || code === '0x0') {
          throw new Error(`Contract not deployed at ${tokenAddress}`);
        }

        // Initialize token contract with full error handling
        try {
          const tokenAbi = RealEstateToken.abi;
          this.tokenContract = new this.web3.eth.Contract(
            tokenAbi,
            tokenAddress,
            {
              from: this.account,
              gas: '1000000'
            }
          );

          // Verify contract is responsive
          const name = await this.tokenContract.methods.name().call();
          const symbol = await this.tokenContract.methods.symbol().call();
          console.log('Token contract verified:', { name, symbol });

        } catch (error) {
          console.error('Token contract initialization failed:', error);
          throw new Error('Failed to initialize token contract');
        }

        // Initialize NFT contract only after token contract is verified
        const nftAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
        if (nftAddress && this.web3.utils.isAddress(nftAddress)) {
          this.nftContract = new this.web3.eth.Contract(
            RealEstateNFT.abi,
            nftAddress,
            {
              from: this.account,
              gas: '1000000'
            }
          );
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          this.account = accounts[0];
        });

        return true;
      } catch (error) {
        console.error('Error initializing Web3:', error);
        throw error;
      }
    } else {
      console.error('Please install MetaMask!');
      return false;
    }
  }

  // ERC20 Token Methods
  async tokenizeProperty(propertyId, totalSupply, price) {
    try {
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }

      // Convert string ID to numeric hash
      const numericId = this.web3.utils.keccak256(propertyId).slice(0, 10);
      const propertyIdNumber = this.web3.utils.hexToNumber(numericId);
      
      const supplyInWei = ethers.utils.parseEther(totalSupply.toString()).toString();
      const priceInWei = ethers.utils.parseEther(price.toString()).toString();

      console.log('Tokenizing property:', {
        originalId: propertyId,
        numericId: propertyIdNumber,
        supply: supplyInWei,
        price: priceInWei
      });

      // Call the contract method with converted values
      const tx = await this.tokenContract.methods
        .tokenizeProperty(propertyIdNumber, supplyInWei, priceInWei)
        .send({ from: this.account });

      console.log('Transaction completed:', tx);
      return true;
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

      const amountInWei = ethers.utils.parseEther(amount.toString());
      const priceInWei = ethers.utils.parseEther(options.price || '0');
      const totalPrice = amountInWei.mul(priceInWei).div(ethers.utils.parseEther('1'));

      const tx = await this.tokenContract.methods
        .purchaseTokens(propertyId, amountInWei, {
          value: totalPrice,
          ...options
        });

      const receipt = await tx.send({ from: this.account });
      return receipt;
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

  async getPropertyDetails(propertyId) {
    try {
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }

      const details = await this.tokenContract.methods
        .getPropertyDetails(propertyId)
        .call();
      return {
        exists: details.exists,
        supply: ethers.utils.formatEther(details.supply || 0),
        pricePerToken: ethers.utils.formatEther(details.pricePerToken || 0),
        availableTokens: ethers.utils.formatEther(details.availableTokens || 0),
        isTokenized: details.isTokenized
      };
    } catch (error) {
      console.error('Error getting property details:', error);
      throw error;
    }
  }
}

export default new Web3Service(); 