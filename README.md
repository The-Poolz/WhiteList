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
truffle migrate --f 1 --to 1 --network dashboard
```

## How's it work?
**The WhiteList** contract provides the ability to create an unlimited number of whitelists, the `CreateManualWhiteList` function is responsible for this.
The address that created the whitelist automatically receives the `Creator role`.
https://github.com/The-Poolz/WhiteList/blob/7139a7f92b11629fa28b8e98c3ebada1f89f226e/contracts/WhiteList.sol#L33-L36
* `_ChangeUntil` is specifies the time during which the whitelist is active. After its expiration, interaction with the current whitelist will be impossible!
* `_Contract` each added address (User) in the whitelist has a certain allocation value. After the selection is empty, the added address automatically becomes inactive. `_Contract` is address that is allowed to shorten the allocation in the whitelist. This opens up the possibility of interacting with other smart contracts, allowing them to change the distribution.

## Contract diagram
![classDiagram](https://user-images.githubusercontent.com/68740472/198850333-812efc5b-8480-49e5-82a1-555320349f6f.svg)

## License
The-Poolz Contracts is released under the MIT License.
