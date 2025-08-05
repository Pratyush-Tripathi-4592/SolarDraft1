const ElectricityToken = artifacts.require("ElectricityToken");
const TransactionManager = artifacts.require("TransactionManager");

module.exports = async function(deployer) {
  // Deploy ElectricityToken first
  await deployer.deploy(ElectricityToken, "ElectricityToken", "ELEC");
  const tokenInstance = await ElectricityToken.deployed();

  // Deploy TransactionManager with the ElectricityToken address
  await deployer.deploy(TransactionManager, tokenInstance.address);
};
