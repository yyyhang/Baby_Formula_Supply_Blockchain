// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./oracle.sol";

interface BabyFormulaInterface {
    function updateStatus(string memory updatedStatus) external;
}

contract BabyFormula is BabyFormulaInterface {
    address manager;
    string public location = "";
    string public status = "";
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

    function updateStatus(string memory updatedStatus) public override {
        status = updatedStatus;
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

contract BabyFormulaTransit is CargoShipTransitOracleClient {
    mapping(uint256 => int256) public temperatures;
    uint256 numTemperatures = 0;

    mapping(uint256 => string) public locations;
    uint256 numLocations = 0;

    mapping(uint256 => string) public devices;
    uint256 numDevices = 0;

    mapping(uint256 => string) public certificates;
    uint256 numCertificates = 0;

    constructor(address oracleAd) CargoShipTransitOracleClient(oracleAd) {}

    function getCargoStatus() public {
        requestCargoStatusFromOracle();
    }

    function receiveCargoStatusFromOracle(
        uint256 requestId,
        int256 _temperature1,
        string memory location,
        string memory device,
        string memory certificate
    ) internal override {
        numTemperatures++;
        temperatures[numTemperatures] = _temperature1;
        
        numLocations++;
        locations[numLocations] = location;

        numDevices++;
        devices[numDevices] = device;

        numCertificates++;
        certificates[numCertificates] = certificate;
    }

    uint256 public numFormula = 0;
    mapping(uint256 => address) public formulaInformation;

    function addBabyFormula(address babyFormula) public returns (uint256) {
        numFormula++;
        formulaInformation[numFormula] = babyFormula;
        return numFormula;
    }

    function endTransit() public {
        bool safe = true;
        uint256 counter = 0;
        for (uint256 i = 0; i < numTemperatures; i++) {
            if (temperatures[i] > 10) {
                counter++;
                if (counter == 2)  {
                    safe = false;
                    break;
                }
            } else {
                counter = 0;
            }
        }
        
        for(uint256 j = 1; j <= numFormula; j++) {
            BabyFormulaInterface(formulaInformation[j]).updateStatus("unsafe");
        }
    }
}
