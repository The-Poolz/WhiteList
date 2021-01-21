// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;

contract WhiteList {
    constructor() public {
        WhiteListCount = 3; //0 is off, 1 is MainCoin, 2 is TokenFilter
    }

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
        uint256 Limit;
        address Creator;
        uint256 ChangeUntil;
        //uint256 DrawLimit;
        //uint256 SignUpPrice;
        address Contract;
    }

    mapping(uint256 => mapping(address => uint256)) public WhitelistDB;
    mapping(uint256 => WhiteListItem) public WhitelistSettings;
    uint256 public WhiteListCost;
    uint256 public WhiteListCount;

    //uint256 public SignUpCost;

    function CreateManualWhiteList(
        uint256 _ChangeUntil,
        uint256 _Limit,
        address _Contract
    ) public payable returns (uint256 Id) {
        require(msg.value >= WhiteListCost);
        WhitelistSettings[WhiteListCount] =  WhiteListItem(
            /*_Limit == 0 ? uint256(-1) :*/
            _Limit,
            msg.sender,
            _ChangeUntil,
            _Contract
        );
        uint256 temp = WhiteListCount;
        WhiteListCount++;
        return temp;
    }

    function AddAddress(uint256 _Id, address[] _Users) public OnlyCreator(_Id) {
        for (uint256 index = 0; index < _Users.length; index++) {
            _AddAddress(_Id, _Users[index]);
        }
    }

    function RemoveAddress(uint256 _Id, address[] _Users) public OnlyCreator(_Id) {
        for (uint256 index = 0; index < _Users.length; index++) {
            _RemoveAddress(_Id, _Users[index]);
        }
    }

    function _AddAddress(uint256 _Id, address user) internal {
        WhitelistDB[_Id][user] = WhitelistSettings[_Id].Limit;
    }

    function _RemoveAddress(uint256 _Id, address user) internal {
        WhitelistDB[_Id][user] = 0;
    }

    function Register(
        address _Subject,
        uint256 _Id,
        uint256 _Amount
    ) external {
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
    }
}
