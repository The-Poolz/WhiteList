const WhiteList = artifacts.require('WhiteList')
const { assert } = require('chai')
const truffleAssert = require('truffle-assertions')
const timeMachine = require('ganache-time-traveler')
const BigNumber = require('bignumber.js');
const constants = require('@openzeppelin/test-helpers/src/constants.js');

contract( 'WhiteList Contract' , async accounts => {
    let instance, fromAddress, id, userLimit = 500, timestamp
    const newLimit = 15
    let whiteListCost
    let contractAddress = accounts[9] // random address for contract

    before(async () => {
        fromAddress = accounts[0]
        instance = await WhiteList.deployed()
        whiteListCost = await instance.Fee()
        const now = Date.now() / 1000 // current timestamp in seconds
        timestamp = Number(now.toFixed()) + 3600 // timestamp one hour from now
    })
    
    it('should create a new manual WhiteList', async () => {
        const value = whiteListCost
        const result = await instance.CreateManualWhiteList(timestamp, contractAddress, {from: fromAddress, value: value})
        const logs = result.logs[0].args
        id = logs._WhiteListCount.toNumber()
        assert.equal(logs._creator, fromAddress)
        assert.equal(logs._contract, contractAddress)
        assert.equal(logs._changeUntil, timestamp)
    })

    it('isReady is false before adding the first address', async () => {
        const result = await instance.WhitelistSettings(id)
        assert.isFalse(result.isReady)
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
        const result = await instance.WhitelistSettings(id)
        assert.isTrue(result.isReady)
    })

    it('reverts when array length of users and amounts is not equal', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]] // array size - 5
        const amountArray = [100, 200, 300] // array size - 3
        await truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress}), 'Number of users should be same as the amount length')
    })

    it('reverts when called by non creator address', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3]] // array size - 5
        const amountArray = [100, 200, 300]
        await truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: accounts[1]}), 'Only creator can access')
    })

    it('reverts when called invalid ID', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3]] // array size - 5
        const amountArray = [100, 200, 300]
        await truffleAssert.reverts(instance.AddAddress(100, accountsArray, amountArray, {from: fromAddress}), 'Wrong ID')
    })

    it('revert after time is expired', async () => {
        await timeMachine.advanceTimeAndBlock(3601)
        const accountsArray = [accounts[1], accounts[2], accounts[3]] // array size - 5
        const amountArray = [100, 200, 300]
        // await instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress})
        await truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress}), 'Time for edit is finished')
        await timeMachine.advanceTimeAndBlock(-3601)
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

    it('update user limit', async () => {
        await instance.setMaxUsersLimit(newLimit)
        const result = await instance.MaxUsersLimit()
        assert.equal(result, newLimit)
        userLimit = result
    })

    it(`should not allow to add users more than ${newLimit}`, async () => {
        // array size - 20
        const accountsArray = []
        const amountArray = []
        for(let i=0; i<userLimit + 1; i++){
            accountsArray.push(accounts[i % accounts.length])
            amountArray.push(100 * i)
        }
        await truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress}), 'Maximum User Limit exceeded')        
    })

    it(`should not allow to remove users more than ${newLimit}`, async () => {
        // array size - 20
        const accountsArray = []
        for(let i=0; i<userLimit + 1; i++){
            accountsArray.push(accounts[i % accounts.length])
        }
        await truffleAssert.reverts(instance.RemoveAddress(id, accountsArray, {from: fromAddress}), 'Maximum User Limit exceeded')        
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
        await instance.SetFeeAmount(newCost)
        const whiteListCost = await instance.Fee()
        assert.equal(web3.utils.toHex(newCost), web3.utils.toHex(whiteListCost))
    })

    it('reverts when value is less than WhiteListCost', async () => {
        const now = Date.now() / 1000 // current timestamp in seconds
        const timestamp = Number(now.toFixed()) + 3600 // timestamp one hour from now
        await truffleAssert.reverts(instance.CreateManualWhiteList(timestamp, contractAddress, {from: fromAddress, value: 0}), 'Not Enough Fee Provided')
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
        await truffleAssert.reverts(instance.Register(userAddress, id,  amount, {from: accounts[1]}), 'Only the Contract can call this')
    })

    it('register reverts when limit is less than amount', async () => {
        const userAddress = accounts[1]
        const userLimit = await instance.Check(userAddress, id)
        const amount = userLimit + 1
        await truffleAssert.reverts(instance.Register(userAddress, id,  amount, {from: contractAddress}), 'Sorry, no alocation for Subject')
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
        // await instance.LastRoundRegister(userAddress, id, {from: contractAddress})
        await truffleAssert.reverts(instance.LastRoundRegister(userAddress, id, {from: contractAddress}), 'Sorry, no alocation for Subject')
    })

    it('should withdraw ETH', async () => {
        const fee = await instance.Fee()
        await instance.CreateManualWhiteList(timestamp, contractAddress, {from: accounts[7], value: fee})
        const owner = await instance.owner()
        const contractBal = new BigNumber(await web3.eth.getBalance(instance.address))
        const oldBal = new BigNumber(await web3.eth.getBalance(owner))
        const txnReceipt = await instance.WithdrawFee(owner, { from: owner })
        const rcpt = await web3.eth.getTransaction(txnReceipt.tx)
        const gasPrice = rcpt.gasPrice
        const actualBalance = new BigNumber((await web3.eth.getBalance(owner)))
        const gas = new BigNumber(txnReceipt.receipt.gasUsed * gasPrice)
        const expectedBalance = BigNumber.sum(oldBal, contractBal).minus(gas)
        assert.equal(actualBalance.toString(), expectedBalance.toString())
    })

    it('should not affect the amount', async () => {
        const userAddress = accounts[1]
        const amount = 10
        const id = 0
        await instance.Register(userAddress, id,  amount, {from: contractAddress})
        await instance.LastRoundRegister(userAddress, id, {from: contractAddress})
        const newUserLimit = await instance.Check(userAddress, id)
        assert.equal(newUserLimit.toString(), constants.MAX_UINT256.toString())
    })
})
