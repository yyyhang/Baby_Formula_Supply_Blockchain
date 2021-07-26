// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./oracle.sol";

contract BabyFormulaTransit is CargoShipTransitOracleClient {
    mapping (uint => int256) public temperatures;
    uint numTemperatures = 0;
    constructor(address oracleAd) CargoShipTransitOracleClient(oracleAd) {}

    function getCargoStatus()
        public
    {
        requestCargoStatusFromOracle();
    }

    function receiveCargoStatusFromOracle(
        uint256 requestId,
        int256 _temperature1
    ) internal override {
        numTemperatures++;
        temperatures[numTemperatures] = _temperature1;
    }
    uint public numFormula = 0;
    mapping(uint => address) public formulaInformation;
    function addBabyFormula(address babyFormula) public returns (uint) {
        numFormula++;
        formulaInformation[numFormula] = babyFormula;
        return numFormula;
    }
}
