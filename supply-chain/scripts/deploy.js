/**
 * filename: scripts/deploy.js
 * purpose: Deploys the SupplyChain contract to the configured network.
 * setup notes: Run with `npx hardhat run scripts/deploy.js --network ganache`.
 */
const hre = require("hardhat");

async function main() {
  try {
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();

    const deployedAddress = await supplyChain.getAddress();
    console.log("============================================");
    console.log("SupplyChain contract deployed successfully.");
    console.log("Contract Address:", deployedAddress);
    console.log("Copy this address into:");
    console.log("- backend/contract.js (CONTRACT_ADDRESS)");
    console.log("- frontend/src/contractConfig.js (CONTRACT_ADDRESS)");
    console.log("============================================");
  } catch (error) {
    console.error("Deployment failed:", error.message);
    process.exitCode = 1;
  }
}

main();
