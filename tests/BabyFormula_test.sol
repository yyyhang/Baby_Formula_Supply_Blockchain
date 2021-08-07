// SPDX-License-Identifier: GPL-3.0
    
pragma solidity >=0.8.00 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/BabyFormula.sol";

contract BabyFormulaTest is BabyFormula {
    
    // Variables used to emulate different remix_accounts
    address mockOwner;
    address mockTransit;
    address mockReceiver;

    /// 'beforeAll' runs before all other tests
    function beforeAll() public {
        mockOwner = TestsAccounts.getAccount(0);
        mockTransit = TestsAccounts.getAccount(1);
        mockReceiver = TestsAccounts.getAccount(2);
    }
    
    function ownerTest() public {
        Assert.equal(owner, mockOwner, 'Owner should be acc0');
    }
    
    /// Try setting transit as a non owner
    /// #sender: account-2
    function setTransitFailure() public {
        try this.setTransit(mockTransit) {
            Assert.ok(false, 'Method Execution should Fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the owner', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly');
        }
    }
    
    /// Set Transit
    function setTransitTest() public {
        setTransit(mockTransit);
        Assert.equal(transitAddress, mockTransit, "Transit should be set successfully");
    }
    
    /// Try setting location as the owner
    /// #sender: account-2
    function setLocationFailure() public {
        try this.updateLocation('Fake Location') {
            Assert.ok(false, 'Method Execution should Fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the transit contract', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly');
        }
    }
    
    /// Update Location
    /// #sender: account-1
    function setLocation() public {
        Assert.equal(location, '', "Location should be set successfully");
        updateLocation('Melbourne');
        Assert.equal(location, 'Melbourne', "Location should be set successfully");
    }
    
    /// Try setting Quality as the owner
    /// #sender: account-0
    function setQualityFailure() public {
        try this.updateQualityStatus('SAFE') {
            Assert.ok(false, 'Method Execution should Fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the transit contract', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly');
        }
    }
    
    /// Update Quality
    /// #sender: account-1
    function setQuality() public {
        Assert.equal(qualityStatus, '', "Quality Status should be unset");
        updateQualityStatus('UNSAFE');
        Assert.equal(qualityStatus, 'UNSAFE', "Quality should be set successfully");
    }
    
    /// Try updating owner as the owner
    /// #sender: account-0
    function setOwnerFailure() public {
        try this.updateOwner(mockReceiver) {
            Assert.ok(false, 'Method Execution should Fail');
        } catch Error(string memory reason) {
            // Compare failure reason, check if it is as expected
            Assert.equal(reason, 'Can only be executed by the transit contract', 'Failed with unexpected reason');
        } catch (bytes memory /*lowLevelData*/) {
            Assert.ok(false, 'Failed unexpectedly');
        }
    }
    
    /// Update Quality
    /// #sender: account-1
    function setOwnerTest() public {
        updateOwner(mockReceiver);
        Assert.equal(owner, mockReceiver, "Owner should be set successfully");
    }
    
}