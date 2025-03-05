const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy RealEstateToken (ERC20)
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy();
  await realEstateToken.deployed();
  console.log("RealEstateToken deployed to:", realEstateToken.address);

  // Deploy RealEstateNFT (ERC721)
  const RealEstateNFT = await hre.ethers.getContractFactory("RealEstateNFT");
  const realEstateNFT = await RealEstateNFT.deploy();
  await realEstateNFT.deployed();
  console.log("RealEstateNFT deployed to:", realEstateNFT.address);

  // Verify contracts on Etherscan/Polygonscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await realEstateToken.deployTransaction.wait(6);
    await realEstateNFT.deployTransaction.wait(6);

    console.log("Verifying contracts...");
    await hre.run("verify:verify", {
      address: realEstateToken.address,
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: realEstateNFT.address,
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 