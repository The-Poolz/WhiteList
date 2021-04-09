const WhiteList = artifacts.require('WhiteList')
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');

contract( 'WhiteList Contract' , async accounts => {
    let instance, fromAddress, id, userLimit = 10
    let whiteListCost = web3.utils.toWei('0.01', 'ether')
    let contractAddress = accounts[9] // random address for contract

    before(async () => {
        fromAddress = accounts[0]
    })

    beforeEach(async () => {
        instance = await WhiteList.deployed()
        // let snapshot = await timeMachine.takeSnapshot();
        // snapshotId = snapshot['result'];
    })
 
    it('should create a new manual WhiteList', async () => {
        const now = Date.now() / 1000 // current timestamp in seconds
        const timestamp = Number(now.toFixed()) + 3600 // timestamp one hour from now
        const value = whiteListCost
        const result = await instance.CreateManualWhiteList(timestamp, contractAddress, {from: fromAddress, value: value})
        const logs = result.logs[0].args
        id = logs._WhiteListCount.toNumber()
        assert.equal(logs._creator, fromAddress)
        assert.equal(logs._contract, contractAddress)
        assert.equal(logs._changeUntil, timestamp)
    })

    it('isReady is false before adding the first address', async () => {
        const isReady = await instance.isWhiteListReady(id)
        assert.isFalse(isReady)
    })

    it('reverts when value is less than WhiteListCost', async () => {
        const now = Date.now() / 1000 // current timestamp in seconds
        const timestamp = Number(now.toFixed()) + 3600 // timestamp one hour from now
        
        const value = whiteListCost
        truffleAssert.reverts(instance.CreateManualWhiteList(timestamp, contractAddress, {from: fromAddress, value: 0}))
    })

    it('should add addresses to whitelist', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]]
        const amountArray = [100, 200, 300, 400, 500]
        await instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress})
        const result1 = await instance.Check(accounts[1], id)
        assert.equal(result1, 100)
        const result2 = await instance.Check(accounts[2], id)
        assert.equal(result2, 200)
        const result3 = await instance.Check(accounts[3], id)
        assert.equal(result3, 300)
        const result4 = await instance.Check(accounts[4], id)
        assert.equal(result4, 400)
        const result5 = await instance.Check(accounts[5], id)
        assert.equal(result5, 500)
    })

    it('isReady is true after adding the first address', async () => {
        const isReady = await instance.isWhiteListReady(id)
        assert.isTrue(isReady)
    })

    it('reverts when array length of users and amounts is not equal', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]] // array size - 5
        const amountArray = [100, 200, 300] // array size - 3
        truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress}))
    })

    it('reverts when called by non creator address', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3]] // array size - 5
        const amountArray = [100, 200, 300]
        truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: accounts[1]}))
    })

    it('reverts when called invalid ID', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3]] // array size - 5
        const amountArray = [100, 200, 300]
        truffleAssert.reverts(instance.AddAddress(100, accountsArray, amountArray, {from: fromAddress}))
    })

    it('revert after time is expired', async () => {
        await timeMachine.advanceTimeAndBlock(3601);
        const accountsArray = [accounts[1], accounts[2], accounts[3]] // array size - 5
        const amountArray = [100, 200, 300]
        // await instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress})
        truffleAssert.reverts(instance.AddAddress(100, accountsArray, amountArray, {from: fromAddress}))
        await timeMachine.advanceTimeAndBlock(-3601);
    })

    it('returns uint256(-1) when id is 0', async () => {
        const result = await instance.Check(accounts[1], 0)
        const hexValue = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        assert.equal(web3.utils.toHex(result), hexValue)
    })

    it('should remove the address from whitelist', async () => {
        const accountsArray = [accounts[4], accounts[5]]
        await instance.RemoveAddress(id, accountsArray, {from: fromAddress})
        const result1 = await instance.Check(accounts[4], id)
        assert.equal(result1, 0)
        const result2 = await instance.Check(accounts[5], id)
        assert.equal(result2, 0)
    })

    it(`returns the value of MaxUsersLimit as ${userLimit}`, async () => {
        const limit = await instance.MaxUsersLimit()
        assert.equal(limit.toNumber(), userLimit)
    })

    it(`should not allow to add users more than ${userLimit}`, async () => {
        // array size - 20
        const accountsArray = [...accounts, ...accounts]
        const amountArray = []
        for(let i=0; i<20; i++){
            amountArray.push(100)
        }
        truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress}))        
    })

    it(`should not allow to remove users more than ${userLimit}`, async () => {
        // array size - 20
        const accountsArray = [...accounts, ...accounts]
        const amountArray = []
        for(let i=0; i<20; i++){
            amountArray.push(100)
        }
        truffleAssert.reverts(instance.RemoveAddress(id, accountsArray, {from: fromAddress}))        
    })

    it('update user limit', async () => {
        const newLimit = 15
        await instance.setMaxUsersLimit(newLimit)
        const result = await instance.MaxUsersLimit()
        assert.equal(result, newLimit)
    })

    it('change creator address', async () => {
        await instance.ChangeCreator(id, accounts[1], {from: fromAddress})
        fromAddress = accounts[1]
        const result = await instance.WhitelistSettings(id)
        assert.equal(result.Creator, accounts[1])
    })

    it('change contract address', async () => {
        await instance.ChangeContract(id, accounts[8], {from: fromAddress})
        const result = await instance.WhitelistSettings(id)
        contractAddress = accounts[8]
        assert.equal(result.Contract, contractAddress)
    })

    it('change WhiteListCost', async () => {
        const newCost = web3.utils.toWei('0.02', 'ether')
        await instance.setWhiteListCost(newCost)
        const whiteListCost = await instance.WhiteListCost()
        assert.equal(web3.utils.toHex(newCost), web3.utils.toHex(whiteListCost))
    })

    it('should register', async () => {
        const userAddress = accounts[1]
        const userLimit = await instance.Check(userAddress, id)
        const amount = 30
        await instance.Register(userAddress, id,  amount, {from: contractAddress})
        const newUserLimit = await instance.Check(userAddress, id)
        assert.equal(newUserLimit, userLimit - amount)
    })

    it('register reverts when called by wrong contract', async () => {
        const userAddress = accounts[1]
        const userLimit = await instance.Check(userAddress, id)
        const amount = 30
        truffleAssert.reverts(instance.Register(userAddress, id,  amount, {from: accounts[1]}))
    })

    it('register reverts when limit is less than amount', async () => {
        const userAddress = accounts[1]
        const userLimit = await instance.Check(userAddress, id)
        const amount = userLimit + 1
        truffleAssert.reverts(instance.Register(userAddress, id,  amount, {from: contractAddress}))
    })

    it('should run LastRoundRegister', async () => {
        const userAddress = accounts[2]
        await instance.LastRoundRegister(userAddress, id, {from: contractAddress})
        const userLimit = await instance.Check(userAddress, id)
        const hexValue = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        assert.equal(web3.utils.toHex(userLimit), hexValue)
    })

    it('should fail LastRoundRegister for twice for same address', async () => {
        const userAddress = accounts[2]
        truffleAssert.reverts(instance.LastRoundRegister(userAddress, id, {from: contractAddress}), 'Sorry, no alocation for Subject')
    })

})
