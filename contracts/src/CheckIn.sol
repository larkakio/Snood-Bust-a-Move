// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain check-in on Base. No ETH accepted — user pays L2 gas only.
/// @dev `lastCheckInDayEncoded` stores (day + 1), where 0 means never checked in (avoids clash with unix day 0).
contract CheckIn {
    mapping(address => uint256) private lastCheckInDayEncoded;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 streak);

    error ValueNotAllowed();
    error AlreadyCheckedInToday();

    function lastCheckInDay(address user) external view returns (uint256) {
        uint256 e = lastCheckInDayEncoded[user];
        return e == 0 ? 0 : e - 1;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotAllowed();

        uint256 day = block.timestamp / 1 days;
        uint256 enc = lastCheckInDayEncoded[msg.sender];
        uint256 lastDay = enc == 0 ? type(uint256).max : enc - 1;

        if (lastDay == day) revert AlreadyCheckedInToday();

        uint256 newStreak;
        if (enc == 0) {
            newStreak = 1;
        } else if (day == lastDay + 1) {
            newStreak = streak[msg.sender] + 1;
        } else {
            newStreak = 1;
        }

        lastCheckInDayEncoded[msg.sender] = day + 1;
        streak[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, day, newStreak);
    }
}
