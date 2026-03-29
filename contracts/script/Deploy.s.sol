// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        CheckIn c = new CheckIn();
        vm.stopBroadcast();
        console2.log("CheckIn deployed at:", address(c));
    }
}
