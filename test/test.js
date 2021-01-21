const Benefit = artifacts.require("Benefit");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
//const truffleAssert = require('truffle-assertions');
//const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";
//var BN = web3.utils.BN;

//const rate = new BN('1000000000'); // with decimal21 (shifter) 1 eth^18 = 1 token^6
//const amount = new BN('3000000'); //3 tokens for sale
//const invest = web3.utils.toWei('1', 'ether'); //1eth;

contract("Benefit", async accounts =>  { 
    it("Swap IsToken ", async () => {
        let instance = await Benefit.deployed();
        console.log(instance.address);
    });
});