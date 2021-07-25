// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract CoatIndicator {
    bool public needToWearCoat = false;
    event temperatureRequest(string city);

    function requestTemperature(string memory city) private {
        emit temperatureRequest(city);
    }

    function requestPhase() public {
        requestTemperature("Melbourne");
    }

    function responsePhase(int256 temperature) public returns (int) {
        emit tem(temperature);
        needToWearCoat = temperature < 0;
        return temperature;
    }
    
    event tem(int256 temperature);
}