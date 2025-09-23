/* eslint-disable no-console */
require('dotenv').config();
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying Trade.sol with account:', deployer.address);

  const seller = process.env.TRADE_SELLER_ADDRESS || deployer.address;
  const buyer = process.env.TRADE_BUYER_ADDRESS || deployer.address;
  const units = Number(process.env.TRADE_UNITS || 100);
  const priceWei = hre.ethers.parseEther(process.env.TRADE_PRICE_ETH || '0.01');

  const Trade = await hre.ethers.getContractFactory('Trade');
  const trade = await Trade.deploy(seller, buyer, units, priceWei);
  const receipt = await trade.deploymentTransaction().wait();

  console.log('Trade deployed to:', await trade.getAddress());
  console.log('Tx hash:', receipt.hash);

  // Copy artifact to build/contracts for runtime use
  const hardhatArtifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'Trade.sol', 'Trade.json');
  const outDir = path.join(__dirname, '..', 'build', 'contracts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(hardhatArtifactPath, path.join(outDir, 'Trade.json'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


