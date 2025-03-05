const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function main() {
  console.log('Starting contract compilation...');

  // Ensure the artifacts directories exist
  const srcArtifactsDir = path.join(__dirname, '../src/contracts');
  if (!fs.existsSync(srcArtifactsDir)) {
    fs.mkdirSync(srcArtifactsDir, { recursive: true });
  }

  // Run hardhat compile
  try {
    await new Promise((resolve, reject) => {
      exec('npx hardhat compile', (error, stdout, stderr) => {
        if (error) {
          console.error('Error during compilation:', error);
          reject(error);
          return;
        }
        
        console.log(stdout);
        
        if (stderr) {
          console.warn('Compilation warnings:', stderr);
        }
        
        resolve();
      });
    });

    // Copy artifacts from hardhat artifacts to src/contracts
    const hardhatArtifactsDir = path.join(__dirname, '../artifacts/contracts');
    const contracts = ['RealEstateToken.sol', 'RealEstateNFT.sol'];

    if (fs.existsSync(hardhatArtifactsDir)) {
      contracts.forEach(contract => {
        const contractName = contract.replace('.sol', '');
        const artifactPath = path.join(hardhatArtifactsDir, `${contract}/${contractName}.json`);
        const destPath = path.join(srcArtifactsDir, `${contractName}.json`);

        if (fs.existsSync(artifactPath)) {
          fs.copyFileSync(artifactPath, destPath);
          console.log(`Copied ${contractName}.json to src/contracts`);
        } else {
          console.warn(`Artifact not found: ${artifactPath}`);
        }
      });

      console.log('Contract artifacts copied successfully!');
    } else {
      console.warn('Hardhat artifacts directory not found:', hardhatArtifactsDir);
    }

    console.log('Contract compilation completed successfully!');
  } catch (error) {
    console.error('Failed to compile contracts:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 