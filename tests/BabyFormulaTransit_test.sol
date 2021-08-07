// SPDX-License-Identifier: GPL-3.0
    
pragma solidity >=0.8.00 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/BabyFormula.sol";

contract BabyFormulaTransitTest is BabyFormulaTransit {
    
    address mockCreator = TestsAccounts.getAccount(0);
    address mockReceiver = TestsAccounts.getAccount(1);
    address mockOracle = TestsAccounts.getAccount(2);
    address mockBabyFormula = TestsAccounts.getAccount(3);
    address mockRandomUser = TestsAccounts.getAccount(4);
    
    constructor() BabyFormulaTransit(mockOracle, mockReceiver) {
    }
    
    function creatorTest() public {
        Assert.equal(creator, mockCreator, 'creator should be acc0');
    }
    
    /// Add Baby formula
    /// #sender: account-0
    function addFormulaTest() public {
        Assert.equal(addBabyFormula(mockBabyFormula), 1, 'Add Baby formula');
    }
    
    /// Add receipt
    function addReceiptTest() public {
        addReceipt('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
        Assert.equal(receiptHash, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 'Add Baby formula Receipt');
    }
    
    // try starting transit as random user
    /// #sender: account-4
    function startTransitFailureTest() public {
        try this.startTransit() {
            Assert.ok(false, 'Method Execution should Fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by owner or receiver', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly');
        }
    }
    
    // Start transit
    function startTransitTest() public {
        startTransit();
        Assert.equal(transitInitiated, true, 'Transit should be started');
    }
    
    /// Try adding formula after transit started
    /// #sender: account-0
    function addFormulaFailureTest() public {
        try this.addBabyFormula(mockBabyFormula) {
            Assert.ok(false, 'Method Execution should Fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed before the transit', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly');
        }
    }
    
    /// Try adding receipt after transit started
    /// #sender: account-0
    function addReceiptFailureTest() public {
        try this.addReceipt('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08') {
            Assert.ok(false, 'Method Execution should Fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed before the transit', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly');
        }
    }
    
    // Receive data readings
    function receiveBabyFormulaStatusTest() public {
        addDataReading(10, 'Melbourne', '2021-03-03');
        Assert.equal(temperatures[1], 10, 'Temperature should be stored');
        Assert.equal(locations[1], 'Melbourne', 'Location should be stored');
        Assert.equal(timeStamps[1], '2021-03-03', 'Time stamp should be stored');
        
        addDataReading(15, 'Sydney', '2021-03-05');
        Assert.equal(temperatures[2], 15, 'Temperature should be stored');
        Assert.equal(locations[2], 'Sydney', 'Location should be stored');
        Assert.equal(timeStamps[2], '2021-03-05', 'Time stamp should be stored');
        
        addDataReading(20, 'Brisbane', '2021-03-07');
        Assert.equal(temperatures[3], 20, 'Temperature should be stored');
        Assert.equal(locations[3], 'Brisbane', 'Location should be stored');
        Assert.equal(timeStamps[3], '2021-03-07', 'Time stamp should be stored');
    }
    
    // Get Safety Status
    function safeQualityTest() public {
        Assert.equal(isSafe(), false, 'Transit should be considered unsafe');
    }
}

contract BabyFormulaTransitTest2 is BabyFormulaTransit {
    
    address mockCreator = TestsAccounts.getAccount(0);
    address mockReceiver = TestsAccounts.getAccount(1);
    address mockOracle = TestsAccounts.getAccount(2);
    address mockBabyFormula = TestsAccounts.getAccount(3);
    
    constructor() BabyFormulaTransit(mockOracle, mockReceiver) {
    }
    
    
    /// Add Baby formula
    /// #sender: account-0
    function addFormulaTest() public {
        Assert.equal(addBabyFormula(mockBabyFormula), 1, 'Add Baby formula');
    }
    
    // Start transit
    function startTransitTest() public {
        startTransit();
        Assert.equal(transitInitiated, true, 'Transit should be started');
    }
    
    
    // Receive data readings
    function receiveBabyFormulaStatusTest() public {
        addDataReading(10, 'Melbourne', '2021-03-03');
        Assert.equal(temperatures[1], 10, 'Temperature should be stored');
        Assert.equal(locations[1], 'Melbourne', 'Location should be stored');
        Assert.equal(timeStamps[1], '2021-03-03', 'Time stamp should be stored');
        
        addDataReading(9, 'Sydney', '2021-03-05');
        Assert.equal(temperatures[2], 9, 'Temperature should be stored');
        Assert.equal(locations[2], 'Sydney', 'Location should be stored');
        Assert.equal(timeStamps[2], '2021-03-05', 'Time stamp should be stored');
        
        addDataReading(9, 'Brisbane', '2021-03-07');
        Assert.equal(temperatures[3], 9, 'Temperature should be stored');
        Assert.equal(locations[3], 'Brisbane', 'Location should be stored');
        Assert.equal(timeStamps[3], '2021-03-07', 'Time stamp should be stored');
    }
    
    // Get Safety Status
    function safeQualityTest() public {
        Assert.equal(isSafe(), true, 'Transit should be considered unsafe');
    }
}