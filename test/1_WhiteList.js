const WhiteList = artifacts.require('WhiteList')
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract( 'WhiteList Contract' , async accounts => {
    let instance, fromAddress, id

    beforeEach(async () => {
        instance = await WhiteList.deployed()
        fromAddress = accounts[0]
    })

    it('should create a new manual WhiteList', async () => {
        const now = Date.now() / 1000 // current timestamp in seconds
        const timestamp = Number(now.toFixed()) + 3600 // timestamp one hour from now
        const contractAddress = accounts[9] // random address
        const result = await instance.CreateManualWhiteList(timestamp, contractAddress, {from: fromAddress})
        const logs = result.logs[0].args
        id = logs._WhiteListCount.toNumber()
        assert.equal(logs._creator, fromAddress)
        assert.equal(logs._contract, contractAddress)
        assert.equal(logs._changeUntil, timestamp)
    })

    it('should add addresses to whitelist', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]]
        const amountArray = [100, 200, 300, 400, 500]
        await instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress})
        const result1 = await instance.check(id, accounts[1])
        assert.equal(result1, 100)
        const result2 = await instance.check(id, accounts[2])
        assert.equal(result2, 200)
        const result3 = await instance.check(id, accounts[3])
        assert.equal(result3, 300)
        const result4 = await instance.check(id, accounts[4])
        assert.equal(result4, 400)
        const result5 = await instance.check(id, accounts[5])
        assert.equal(result5, 500)
    })

    it('reverts when array length of users and amounts is not equal', async () => {
        const accountsArray = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]]
        const amountArray = [100, 200, 300]
        truffleAssert.reverts(instance.AddAddress(id, accountsArray, amountArray, {from: fromAddress}))
    })

    it('returns uint typecast of -1 when id is 0', async () => {
        const result = await instance.check(0, accounts[1])
        const hexValue = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        assert.equal(web3.utils.toHex(result), hexValue)
    })

    it('should remove the address from whitelist', async () => {
        const accountsArray = [accounts[4], accounts[5]]
        await instance.RemoveAddress(id, accountsArray, {from: fromAddress})
        const result1 = await instance.check(id, accounts[4])
        assert.equal(result1, 0)
        const result2 = await instance.check(id, accounts[5])
        assert.equal(result2, 0)
    })

})