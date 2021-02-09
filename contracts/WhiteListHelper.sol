// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;

contract WhiteListHelper {
    event NewWhiteList(uint _WhiteListCount, address _creator, address _contract, uint _changeUntil);

    modifier OnlyCreator(uint256 _Id) {
        require(
            WhitelistSettings[_Id].Creator == msg.sender,
            "Only creator can add"
        );
        require(
            now < WhitelistSettings[_Id].ChangeUntil,
            "Time for edit is finished"
        );
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
    }

    mapping(uint256 => mapping(address => uint256)) public WhitelistDB;
    mapping(uint256 => WhiteListItem) public WhitelistSettings;
    uint256 public WhiteListCost;
    uint256 public WhiteListCount;

    function _AddAddress(uint256 _Id, address user, uint amount) internal {
        WhitelistDB[_Id][user] = amount;
    }

    function _RemoveAddress(uint256 _Id, address user) internal {
        WhitelistDB[_Id][user] = 0;
    }

    //View function to check if address is whitelisted
    function check(uint256 _id, address _user) external view returns(uint){
        if (_id == 0) return uint256(-1);
        return WhitelistDB[_id][_user];
    }
}