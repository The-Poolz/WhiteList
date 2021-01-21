const Benefit = artifacts.require("./Benefit");

module.exports = function (deployer) {
  deployer.deploy(Benefit);
};
