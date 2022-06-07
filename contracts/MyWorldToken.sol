//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// import "hardhat/console.sol";

contract BlackList is Ownable {
    mapping(address => bool) public isBlacklisted;

    function blackList(address _user) public onlyOwner {
        require(!isBlacklisted[_user], "user already blacklisted");
        isBlacklisted[_user] = true;
        // emit events as well
    }

    function removeFromBlacklist(address _user) public onlyOwner {
        require(isBlacklisted[_user], "user already whitelisted");
        isBlacklisted[_user] = false;
        // emit events as well
    }
}

//ERC20 토큰 전송시 해당 물량을 특정 기간동안 락업하는 기능을 추가한다.
//각 전송 마다 전송된 물량의 전부를 락업한다.
contract LockBalance {
    struct LockInfo {
        uint256 amount;
        uint256 releaseTime;
    }

    mapping(address => LockInfo[]) private _lockInfo;

    function getLockedBalance(address _addr) public view returns (uint256) {
        uint256 totalLocked = 0;
        for (uint256 i = 0; i < _lockInfo[_addr].length; i++) {
            // console.log(_lockInfo[_addr][i].releaseTime, block.timestamp);
            if (_lockInfo[_addr][i].releaseTime > block.timestamp) totalLocked += _lockInfo[_addr][i].amount;
        }
        return totalLocked;
    }

    function AddLockinfo(
        address to,
        uint256 amount,
        uint256 releaseTime
    ) internal {
        //remove released lockinfos
        uint256 lockCount = 0;
        for (uint256 i = 0; i < _lockInfo[to].length; i++) {
            if (_lockInfo[to][i].releaseTime > block.timestamp) {
                lockCount++;
            }
            if (i != lockCount - 1) {
                _lockInfo[to][lockCount] = _lockInfo[to][i];
            }
        }
        uint256 removeCount = _lockInfo[to].length - lockCount;
        if (lockCount == 0) delete _lockInfo[to];
        else if (removeCount > 0) {
            // console.log("removed count", removeCount);
            for (uint256 i = 0; i < removeCount; i++) _lockInfo[to].pop();
        }

        //add lockinfo if release time
        if (releaseTime > block.timestamp) _lockInfo[to].push(LockInfo(amount, releaseTime));
        else {
            // console.log("not added", releaseTime, block.timestamp);
        }
    }
}

contract MyWorldToken is ERC20, Ownable, Pausable, BlackList, LockBalance {
    constructor() ERC20("MyWorldToken", "MWT") {
        uint256 amount = 20_0000_0000 * 10**decimals();
        _mint(_msgSender(), amount);
    }

    function stop() public onlyOwner {
        _pause();
    }

    function start() public onlyOwner {
        _unpause();
    }

    //Don't accept ETH or BNB
    receive() external payable {
        revert("Don't accept ETH or BNB");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC20Pausable: token transfer while paused");
        require(!isBlacklisted[from], "blacklisted from");
        require(!isBlacklisted[to], "blacklisted to");

        if (from != address(0)) {
            //not minting
            uint256 locked = getLockedBalance(from);
            uint256 accountBalance = balanceOf(from);
            require(accountBalance - locked >= amount, "Timelock: some balance has locked.");
        }
    }

    function transferWithLocked(
        address to,
        uint256 amount,
        uint256 releaseTime
    ) public returns (bool) {
        transfer(to, amount);

        AddLockinfo(to, amount, releaseTime);

        return true;
    }
}
