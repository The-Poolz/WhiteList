// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;

contract WhiteList {
    constructor() public {
        WhiteListCount = 1; //0 is off
    }

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

    //View function to check if address is whitelisted
    function check(uint256 _id, address _user) external view returns(uint){
        if (_id == 0) return uint256(-1);
        return WhitelistDB[_id][_user];
    }

    function _AddAddress(uint256 _Id, address user, uint amount) internal {
        WhitelistDB[_Id][user] = amount;
    }

    function _RemoveAddress(uint256 _Id, address user) internal {
        WhitelistDB[_Id][user] = 0;
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