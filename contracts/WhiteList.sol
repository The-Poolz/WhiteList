// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;

import "./WhiteListHelper.sol";

contract WhiteList is WhiteListHelper{
    constructor() public {
        WhiteListCount = 1; //0 is off
    }

    //uint256 public SignUpCost;

    function CreateManualWhiteList(
        uint256 _ChangeUntil,
        address _Contract
    ) public payable returns (uint256 Id) {
        require(msg.value >= WhiteListCost);
        WhitelistSettings[WhiteListCount] =  WhiteListItem(
            /*_Limit == 0 ? uint256(-1) :*/
            // _Limit,
            msg.sender,
            _ChangeUntil,
            _Contract
        );
        uint256 temp = WhiteListCount;
        WhiteListCount++;
        emit NewWhiteList(temp, msg.sender, _Contract, _ChangeUntil);
        return temp;
    }

    function AddAddress(uint256 _Id, address[] _Users, uint256[] _Amount) public OnlyCreator(_Id) {
        require(_Users.length == _Amount.length, "Number of users should be same as the amount length");
        for (uint256 index = 0; index < _Users.length; index++) {
            _AddAddress(_Id, _Users[index], _Amount[index]);
        }
    }

    function RemoveAddress(uint256 _Id, address[] _Users) public OnlyCreator(_Id) {
        for (uint256 index = 0; index < _Users.length; index++) {
            _RemoveAddress(_Id, _Users[index]);
        }
    }
    
    function Register(
        address _Subject,
        uint256 _Id,
        uint256 _Amount
    ) external {
        if (_Id == 0) return;
        require(
            msg.sender == WhitelistSettings[_Id].Contract,
            "Only the Contract can call this"
        );
        require(
            WhitelistDB[_Id][_Subject] >= _Amount,
            "Sorry, no alocation for Subject"
        );
        uint256 temp = WhitelistDB[_Id][_Subject] - _Amount;
        WhitelistDB[_Id][_Subject] = temp;
        require(WhitelistDB[_Id][_Subject] == temp);
    }
}

// limit 0 scenario
// safemath
// whitelistDB inside the struct
// integrations
// whitelistcost