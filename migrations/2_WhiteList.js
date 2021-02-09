const WhiteList = artifacts.require("WhiteList");

module.exports = function (deployer) {
  deployer.deploy(WhiteList);
};
