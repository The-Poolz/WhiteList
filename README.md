# WhiteList

[![Build Status](https://travis-ci.com/The-Poolz/WhiteList.svg?branch=master)](https://travis-ci.com/The-Poolz/WhiteList)
[![codecov](https://codecov.io/gh/The-Poolz/WhiteList/branch/master/graph/badge.svg?token=lCJvViiyQc)](https://codecov.io/gh/The-Poolz/WhiteList)
[![CodeFactor](https://www.codefactor.io/repository/github/the-poolz/whitelist/badge)](https://www.codefactor.io/repository/github/the-poolz/whitelist)

**WhiteList** is a smart contract that creates a mechanism to explicitly allow certain identified addresses to access a certain privilege.  This is the opposite of a blacklist, which is a list of prohibited things when everything is allowed by default.

### Navigation

- [Installation](#installation)
- [How's it work?](#hows-it-work)
- [Contract diagram](#contract-diagram)
- [License](#license)
#### Installation

```console
npm install
```

#### Testing

```console
truffle run coverage
```

#### Deployment

```console
truffle dashboard
```

```console
truffle migrate --network dashboard
```

## How's it work?
**The WhiteList** contract provides the ability to create an unlimited number of whitelists, the `CreateManualWhiteList` function is responsible for this.
The address that created the whitelist automatically receives the `Creator role`.
https://github.com/The-Poolz/WhiteList/blob/7139a7f92b11629fa28b8e98c3ebada1f89f226e/contracts/WhiteList.sol#L33-L36
* `_ChangeUntil` is specifies the time during which the whitelist is active. After its expiration, interaction with the current whitelist will be impossible!
* By default, the added address (User) in the whitelist has a certain allocation value.`_Contract` is address that is allowed to shorten the allocation in the whitelist. This opens up the possibility of interacting with other smart contracts, allowing them to change the distribution. Whitelist [interface](https://github.com/The-Poolz/Poolz-Helper/blob/master/contracts/interfaces/IWhiteList.sol) for using third-party smart contracts.
* Each whitelist has a unique `id` returned when it is created, which can be used to determine its uniqueness.

<code><b>NOTICE:</b>  <em>Contract role</em> can be passed to a normal user address. The input address will be able to use the</pre> 
<a href="https://github.com/The-Poolz/WhiteList/blob/master/contracts/WhiteList.sol#L99">Register</a> and <a href="https://github.com/The-Poolz/WhiteList/blob/master/contracts/WhiteList.sol#L118">LastRoundRegister</a> functions.
</code>

`CreateManualWhiteList` example of a [transaction](https://bscscan.com/tx/0x8ea2406df70c4cb611545b8b99d584b75ec7b27b9642720e31d4e60fc171ee41) in a blockchain scanner.

### Add address to whitelist
The `Creator` defines the whitelist members by specifying an array and a distribution of their amounts.
https://github.com/The-Poolz/WhiteList/blob/b9e8306c169e6759a7a5e1f1d2fec9133c445156/contracts/WhiteList.sol#L70
Each added address will be automatically added to the whitelist in the presence of an allocation.

`AddAddress` example of a [transaction](https://bscscan.com/tx/0x4961695b61b7ce91427f70516e2a614151db03e066577b6b7ead7589de7f5bff) in a blockchain scanner.

### Remove address from whitelist
https://github.com/The-Poolz/WhiteList/blob/98db67799fcb2363c7361a383204f0c29704e4ed/contracts/WhiteList.sol#L87
Each removable address will receive a zero allocation value in the whitelist.

`RemoveAddress` example of a [transaction](https://bscscan.com/tx/0xf0dbbe0d93896f0c59a5c4c5caf37621902a34f173c6260ec89c326419ad472d) in a blockchain scanner.

### Check address allocation 
Want to check if an address is whitelisted? `Check` function returns `user` allocation.
https://github.com/The-Poolz/WhiteList/blob/98db67799fcb2363c7361a383204f0c29704e4ed/contracts/WhiteListHelper.sol#L53

### User registration
There are two ways to reduce the allocation of `Subject` by a certain value: the first is to use the `AddAddress` function, the second is the `Register` function.
The main difference between them is that `Register` can only use the `Contract role`.
https://github.com/The-Poolz/WhiteList/blob/98db67799fcb2363c7361a383204f0c29704e4ed/contracts/WhiteList.sol#L99-L103

### Last round register
The `LastRoundRegister` opens the possibility of disabling the scope of allocation restrictions. 
https://github.com/The-Poolz/WhiteList/blob/98db67799fcb2363c7361a383204f0c29704e4ed/contracts/WhiteList.sol#L118-L121
* Each added `_Subject` will receive the maximum possible allocation.
*  Only the `Contract role` can use this function.

### Change creator
https://github.com/The-Poolz/WhiteList/blob/98db67799fcb2363c7361a383204f0c29704e4ed/contracts/WhiteList.sol#L52
In situations where the contract creates a whitelist and it is necessary to transfer the creator's right to a specific address, the `ChangeCreator` function can help us. Or we just need to update the creator role.

`ChangeCreator` example of a [transaction](https://bscscan.com/tx/0x8970ceb73e710f1ace750d9e98eb9f3ec50692eb29bef00b88774ee8c5d8640e) in a blockchain scanner.

## Contract diagram
![classDiagram](https://user-images.githubusercontent.com/68740472/198993344-40825dd1-7699-4820-96d8-d2cfec0bbab7.svg)

## License
The-Poolz Contracts is released under the MIT License.
