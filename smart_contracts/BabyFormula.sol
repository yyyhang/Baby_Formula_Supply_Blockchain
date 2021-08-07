// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./oracle.sol";

contract BabyFormula {
    address public owner;
    string public location = "";
    string public qualityStatus = "";
    address public transitAdresss;

    constructor() {
        owner = msg.sender;
    }

    function setTransit(address transitAddress) public restricted {
        transitAdresss = transitAddress;
    }

    function updateLocation(string memory updatedLocation)
        public
        transitOnly
    {
        location = updatedLocation;
    }

    function updateQualityStatus(string memory updatedQualityStatus)
        public
        transitOnly
    {
        qualityStatus = updatedQualityStatus;
    }

    function updateOwner(address updatedOwner) public transitOnly {
        owner = updatedOwner;
    }

    modifier restricted() {
        require(msg.sender == owner, "Can only be executed by the owner");
        _;
    }

    modifier transitOnly() {
        require(
            msg.sender == transitAdresss,
            "Can only be executed by the transit contract"
        );
        _;
    }
}

contract BabyFormulaTransit is BabyFormulaStatusOracleClient {
    address public creator;
    address public receiver;
    string public receiptHash;

    bool transitInitiated = false;
    bool transitFinished = false;

    mapping(uint256 => int256) public temperatures;
    uint256 numTemperatures = 0;

    mapping(uint256 => string) public locations;
    uint256 numLocations = 0;

    mapping(uint256 => string) public devices;
    uint256 numDevices = 0;

    mapping(uint256 => string) public certificates;
    uint256 numCertificates = 0;

    constructor(address oracleAd, address endOwner)
        BabyFormulaStatusOracleClient(oracleAd)
    {
        creator = msg.sender;
        receiver = endOwner;
    }

    function getBabyFormulaStatus() public transitOngoing {
        requestBabyFormulaStatusFromOracle();
    }

    function receiveBabyFormulaStatusFromOracle(
        uint256 requestId,
        int256 _temperature1,
        string memory location,
        string memory device,
        string memory certificate
    ) internal override transitOngoing {
        numTemperatures++;
        temperatures[numTemperatures] = _temperature1;

        numLocations++;
        locations[numLocations] = location;

        for (uint256 j = 1; j <= numFormula; j++) {
            BabyFormula(formulaInformation[j]).updateLocation(
                location
            );
        }

        numDevices++;
        devices[numDevices] = device;

        numCertificates++;
        certificates[numCertificates] = certificate;
    }

    uint256 public numFormula = 0;
    mapping(uint256 => address) public formulaInformation;

    function addBabyFormula(address babyFormula)
        public
        beforeTransit
        creatorOnly
        returns (uint256)
    {
        numFormula++;
        formulaInformation[numFormula] = babyFormula;
        return numFormula;
    }

    function addReceipt(string memory receiptHash)
        public
        beforeTransit
        creatorOnly
    {   
        receiptHash = receiptHash;
    }

    function startTransit() public creatorOnly beforeTransit {
        transitInitiated = true;
    }

    function endTransit() public receiverOnly transitOngoing {
        bool safe = true;
        uint256 counter = 0;
        for (uint256 i = 0; i < numTemperatures; i++) {
            if (temperatures[i] > 10) {
                counter++;
                if (counter == 2) {
                    safe = false;
                    break;
                }
            } else {
                counter = 0;
            }
        }

        for (uint256 j = 1; j <= numFormula; j++) {
            string memory updatedQuality = safe ? "SAFE" : "UNSAFE";
            BabyFormula(formulaInformation[j]).updateQualityStatus(
                updatedQuality
            );
            if (safe) {
                BabyFormula(formulaInformation[j]).updateOwner(
                    receiver
                );
            }
        }

        transitFinished = true;
    }

    modifier creatorOnly() {
        require(
            msg.sender == creator,
            "Can only be executed by the contract creator"
        );
        _;
    }

    modifier receiverOnly() {
        require(msg.sender == receiver, "Can only be executed by the receiver");
        _;
    }

    modifier beforeTransit() {
        require(
            transitInitiated == false,
            "Can only be executed before the transit"
        );
        _;
    }

    modifier transitOngoing() {
        require(
            transitFinished == false && transitInitiated == true,
            "Can only be executed during the transit"
        );
        _;
    }
}
