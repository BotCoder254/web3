const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying RealEstateToken contract...");
  
  // Get the contract factory
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  
  // Deploy the contract
  const realEstateToken = await RealEstateToken.deploy();
  await realEstateToken.deployed();
  
  console.log("RealEstateToken deployed to:", realEstateToken.address);
  
  // Write the contract address to .env file
  const fs = require('fs');
  const envFile = '.env';
  const envContent = fs.readFileSync(envFile, 'utf8');
  const updatedContent = envContent.replace(
    /REACT_APP_TOKEN_CONTRACT_ADDRESS=.*/,
    `REACT_APP_TOKEN_CONTRACT_ADDRESS=${realEstateToken.address}`
  );
  fs.writeFileSync(envFile, updatedContent);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 