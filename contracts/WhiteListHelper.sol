// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "poolz-helper-v2/contracts/FeeBaseHelper.sol";

contract WhiteListHelper is FeeBaseHelper {
    event NewWhiteList(uint _WhiteListCount, address _creator, address _contract, uint _changeUntil);

    modifier OnlyCreator(uint256 _Id) {
        require(
            WhitelistSettings[_Id].Creator == msg.sender,
            "Only creator can access"
        );
        _;
    }

    modifier TimeRemaining(uint256 _Id){
        require(
            block.timestamp < WhitelistSettings[_Id].ChangeUntil,
            "Time for edit is finished"
        );
        _;
    }

    modifier ValidateId(uint256 _Id){
        require(_Id < WhiteListCount, "Wrong ID");
        _;
    }

    struct WhiteListItem {
        // uint256 Limit;
        address Creator;
        uint256 ChangeUntil;
        //uint256 DrawLimit;
        //uint256 SignUpPrice;
        address Contract;
        // mapping(address => uint256) WhiteListDB;
        bool isReady; // defualt false | true after first address is added
    }

    mapping(uint256 => mapping(address => uint256)) public WhitelistDB;
    mapping(uint256 => WhiteListItem) public WhitelistSettings;
    uint256 public WhiteListCount;

    function _AddAddress(uint256 _Id, address user, uint amount) internal {
        WhitelistDB[_Id][user] = amount;
    }

    function _RemoveAddress(uint256 _Id, address user) internal {
        WhitelistDB[_Id][user] = 0;
    }

    //View function to Check if address is whitelisted
    function Check(address _user, uint256 _id) public view returns(uint){
        if (_id == 0) return type(uint).max;
        return WhitelistDB[_id][_user];
    }
}