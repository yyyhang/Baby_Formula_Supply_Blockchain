// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./oracle.sol";

contract BabyFormula {
    address public owner;
    string public location;
    string public qualityStatus;
    address public transitAddress;

    constructor() {
        owner = msg.sender;
    }
    
    /// @notice Set transit contract
    /// @param transit - address of transit contract
    function setTransit(address transit) public restricted {
        transitAddress = transit;
    }
    
    /// @notice Update formula location
    /// @param updatedLocation - name of location
    function updateLocation(string memory updatedLocation)
        public
        transitOnly
    {
        location = updatedLocation;
    }
    
    /// @notice Update quality status
    /// @param updatedQualityStatus - updated status
    function updateQualityStatus(string memory updatedQualityStatus)
        public
        transitOnly
    {
        qualityStatus = updatedQualityStatus;
    }
    
    /// @notice Update owner
    /// @param updatedOwner - updated owner
    function updateOwner(address updatedOwner) public transitOnly {
        owner = updatedOwner;
    }
    
    /// @notice Only Owner can do
    modifier restricted() {
        require(msg.sender == owner, "Can only be executed by the owner");
        _;
    }
    
    /// @notice Only Transit contract can do
    modifier transitOnly() {
        require(
            msg.sender == transitAddress,
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

    mapping(uint256 => int256) public temperatures; // temperature readings
    uint256 numTemperatures = 0;

    mapping(uint256 => string) public locations;  // locations readings
    uint256 numLocations = 0;

    mapping(uint256 => string) public timeStamps; // timestamp readings
    uint256 numTimeStamps = 0;

    constructor(address oracleAd, address endOwner)
        BabyFormulaStatusOracleClient(oracleAd)
    {
        creator = msg.sender;
        receiver = endOwner;
    }
    
    /// @notice Emit request to fetch oracle data
    function getBabyFormulaStatus() public creatorOrReceiverOnly transitOngoing {
        requestBabyFormulaStatusFromOracle();
    }
    
    /// @notice receive new data reading from Oracle and update formula location
    /// @param temperatureValue - temperature
    /// @param locationName -  Name of the location
    /// @param timeStampString - Timestamp string
    function receiveBabyFormulaStatusFromOracle(
        uint256 requestId,
        int256 temperatureValue,
        string memory locationName,
        string memory device,
        string memory timeStampString
    ) internal override transitOngoing {
        addDataReading(temperatureValue, locationName, timeStampString);

        for (uint256 j = 1; j <= numFormula; j++) {
            BabyFormula(formulaInformation[j]).updateLocation(
                locationName
            );
        }
    }
    
    /// @notice Add a new data reading from Oracle
    /// @param temperatureValue - temperature
    /// @param locationName -  Name of the location
    /// @param timeStampString - Timestamp string
    function addDataReading(int256 temperatureValue,
        string memory locationName,
        string memory timeStampString) internal {
        
        numTemperatures++;
        temperatures[numTemperatures] = temperatureValue;

        numLocations++;
        locations[numLocations] = locationName;
        
        numTimeStamps++;
        timeStamps[numTimeStamps] = timeStampString;
    }

    uint256 public numFormula = 0;
    mapping(uint256 => address) public formulaInformation;
    
    /// @notice Add Baby formula to transit
    /// @param babyFormula - address of babyFormula
    /// @return Number of the baby formula added so far
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
    
    /// @notice Add Transit Receipt
    /// @param receipt - hash of receipt file
    function addReceipt(string memory receipt)
        public
        beforeTransit
        creatorOnly
    {   
        receiptHash = receipt;
    }
    
    /// @notice Start the journey
    function startTransit() public creatorOrReceiverOnly beforeTransit {
        transitInitiated = true;
    }
    
    /// @notice End the journey
    function endTransit() public creatorOrReceiverOnly transitOngoing {
        bool safe = isSafe();
        transitFinished = true;

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
    }
    
    function isSafe() internal view returns (bool) {
        bool safe = true;
        uint256 counter = 0;
        for (uint256 i = 1; i <= numTemperatures; i++) {
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
        return safe;
    }
    
    /// @notice Only creator can do
    modifier creatorOnly() {
        require(
            msg.sender == creator,
            "Can only be executed by the contract creator"
        );
        _;
    }
    
    /// @notice Only the reciever of Formula can do
    modifier receiverOnly() {
        require(msg.sender == receiver, "Can only be executed by the receiver");
        _;
    }
    
    /// @notice Only the owner or reciever of Formula can do
    modifier creatorOrReceiverOnly() {
        require((msg.sender == creator || msg.sender == receiver), "Can only be executed by owner or receiver");
        _;
    }
    
    /// @notice Only before the journey has started
    modifier beforeTransit() {
        require(
            transitInitiated == false,
            "Can only be executed before the transit"
        );
        _;
    }
    
    /// @notice Only during the transit
    modifier transitOngoing() {
        require(
            transitFinished == false && transitInitiated == true,
            "Can only be executed during the transit"
        );
        _;
    }
}
