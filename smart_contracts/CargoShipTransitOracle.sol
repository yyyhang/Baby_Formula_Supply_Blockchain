// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./oracle.sol";

contract CargoShipTransitOracle is Oracle {
    constructor(address serverAddr) Oracle(serverAddr) {}
}