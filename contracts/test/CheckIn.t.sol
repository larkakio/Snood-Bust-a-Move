// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn internal c;
    address internal alice = address(0xA11CE);

    function setUp() public {
        c = new CheckIn();
    }

    function test_checkIn_first_time() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit CheckIn.CheckedIn(alice, block.timestamp / 1 days, 1);
        c.checkIn();
        assertEq(c.streak(alice), 1);
    }

    function test_checkIn_reverts_with_value() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(CheckIn.ValueNotAllowed.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_checkIn_twice_same_day_reverts() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_checkIn_streak_consecutive_days() public {
        uint256 day = block.timestamp / 1 days;
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);

        vm.warp((day + 1) * 1 days + 1);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 2);
    }

    function test_checkIn_streak_resets_after_gap() public {
        uint256 day = block.timestamp / 1 days;
        vm.prank(alice);
        c.checkIn();

        vm.warp((day + 3) * 1 days + 1);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);
    }
}
