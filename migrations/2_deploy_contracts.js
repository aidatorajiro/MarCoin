var MarCoin = artifacts.require("./MarCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(MarCoin);
};
