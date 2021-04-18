// SPDX-License-Identifier: MIT
pragma solidity >=0.4.24 <0.7.0;

import "./WhiteListHelper.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract WhiteList is WhiteListHelper, Ownable{
    constructor() public {
        WhiteListCount = 1; //0 is off
        MaxUsersLimit = 10;
        WhiteListCost = 0.01 ether;
    }

    //uint256 public SignUpCost;
    uint256 public MaxUsersLimit;

    modifier isBelowUserLimit(uint256 _limit) {
        require(_limit <= MaxUsersLimit, "Maximum User Limit exceeded");
        _;
    }

    function setMaxUsersLimit(uint256 _limit) external onlyOwner {
        MaxUsersLimit = _limit;
    }
    
    function WithdrawETHFee(address payable _to) public onlyOwner {
        _to.transfer(address(this).balance); 
    }

    function setWhiteListCost(uint256 _newCost) external onlyOwner {
        WhiteListCost = _newCost;
    }

    function CreateManualWhiteList(
        uint256 _ChangeUntil,
        address _Contract
    ) public payable returns (uint256 Id) {
        require(msg.value >= WhiteListCost, "ether not enough");
        WhitelistSettings[WhiteListCount] =  WhiteListItem(
            /*_Limit == 0 ? uint256(-1) :*/
            // _Limit,
            msg.sender,
            _ChangeUntil,
            _Contract,
            false
        );
        uint256 temp = WhiteListCount;
        WhiteListCount++;
        emit NewWhiteList(temp, msg.sender, _Contract, _ChangeUntil);
        return temp;
    }

    function ChangeCreator(uint256 _Id, address _NewCreator)
        external
        OnlyCreator(_Id)
        TimeRemaining(_Id)
        ValidateId(_Id)
    {
        WhitelistSettings[_Id].Creator = _NewCreator;
    }

    function ChangeContract(uint256 _Id, address _NewContract)
        external
        OnlyCreator(_Id)
        TimeRemaining(_Id)
        ValidateId(_Id)
    {
        WhitelistSettings[_Id].Contract = _NewContract;
    }

    function AddAddress(uint256 _Id, address[] calldata _Users, uint256[] calldata _Amount)
        public
        OnlyCreator(_Id)
        TimeRemaining(_Id)
        ValidateId(_Id)
        isBelowUserLimit(_Users.length)
    {
        require(_Users.length == _Amount.length, "Number of users should be same as the amount length");
        require(_Users.length > 0,"Need something...");
        if(!WhitelistSettings[_Id].isReady){
            WhitelistSettings[_Id].isReady = true;
        }
        for (uint256 index = 0; index < _Users.length; index++) {
            _AddAddress(_Id, _Users[index], _Amount[index]);
        }
    }

    function RemoveAddress(uint256 _Id, address[] calldata _Users)
        public
        OnlyCreator(_Id)
        TimeRemaining(_Id)
        ValidateId(_Id)
        isBelowUserLimit(_Users.length)
    {
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
        assert(WhitelistDB[_Id][_Subject] == temp);
    }

    function LastRoundRegister(
        address _Subject,
        uint256 _Id
    ) external {
        if (_Id == 0) return;
        require(
            msg.sender == WhitelistSettings[_Id].Contract,
            "Only the Contract can call this"
        );
        require(
            WhitelistDB[_Id][_Subject] != uint256(-1),
            "Sorry, no alocation for Subject"
        );
        uint256 temp = uint256(-1);
        WhitelistDB[_Id][_Subject] = temp;
        assert(WhitelistDB[_Id][_Subject] == temp);
    }
}
