// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract BabyFormula {
    address manager;
    string public location = "";
    address public transitAdresss;

    constructor () {
        manager = msg.sender;           
    }

    function setTransit(address transitAddress) public restricted {
        transitAdresss = transitAddress;
    }

    function updateLocation(string memory updatedLocation) public transitOnly {
        location = updatedLocation;
    }

    modifier restricted() {
        require (msg.sender == manager, "Can only be executed by the manager");
        _;
    }

    modifier transitOnly() {
        require (msg.sender == transitAdresss, "Can only be executed by the transit contract");
        _;
    }

}