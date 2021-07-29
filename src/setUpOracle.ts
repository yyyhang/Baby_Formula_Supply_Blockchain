import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
import { callDeployedContract, deployContract } from './deploy';
import { handleRequestEvent } from './listen';
import { loadCompiledSols } from './load';
import { methodSend } from './send';
import { Contract } from 'web3-eth-contract';
let fs = require('fs');
const db = require("./db");

function initializeProvider(): WebsocketProvider {
    try {
        let provider_data = fs.readFileSync('eth_providers/providers.json');
        let provider_json = JSON.parse(provider_data);
        let provider_link = provider_json["provider_link"];
        return new Web3.providers.WebsocketProvider(provider_link);
    } catch (error) {
        throw "Cannot read provider";
    }
}

function getAccount(web3: Web3, name: string): Account {
    try {
        let account_data = fs.readFileSync('eth_accounts/accounts.json');
        let account_json = JSON.parse(account_data);
        let account_pri_key = account_json[name]["pri_key"];
        return web3.eth.accounts.wallet.add('0x' + account_pri_key);
    } catch (error) {
        throw "Cannot read account";
    }
}

(async function run() {
    let web3Provider!: WebsocketProvider;
    let web3!: Web3;
    try {
        web3Provider = initializeProvider();
        web3 = new Web3(web3Provider);
    } catch (e) {
        throw "web3 cannot be initialized";
    }

    try {
        let account = getAccount(web3, "iot_device_1");
        let loaded = loadCompiledSols(["oracle", "BabyFormulaStatusOracle"]);
        let contract = await deployContract(web3!, account, loaded.contracts["BabyFormulaStatusOracle"]["BabyFormulaStatusOracle"].abi, loaded.contracts["BabyFormulaStatusOracle"]["BabyFormulaStatusOracle"].evm.bytecode.object, [account.address]);
        console.log("Baby Formula Oracle contract address: " + contract.options.address);
        
        let counter = 0;
        handleRequestEvent(contract, async (caller: String, requestId: Number, data: any) => {
            // call the database
            counter = counter >= 5 ? 5 : counter + 1;
            var sql = "SELECT * FROM key_events WHERE address = ? AND track_id = ?";
            // console.log('counter:',counter);
            let result = await db.query(
                sql, [caller, counter]
            );
            let temperatureString = result[0]['temperature'];
            let temperatureHex1!: String;
            let location = result[0]['location'];
            let device = result[0]['device'];
            let updated_time = result[0]['updated_time'];
    
            console.log("the temperature is " + temperatureString + ', location is ' + location + ', device is ' + device + ', updated time is ' + updated_time);
    
            try {
                const temperature = parseInt(temperatureString)
                temperatureHex1 = web3.utils.toTwosComplement(temperature);
            } catch (e) {
                console.error("invalid temperature grabbed");
                console.error(e);
                return;
            }
    
            let params = web3.eth.abi.encodeParameters(['uint256', 'string', 'string', 'string'], [temperatureHex1, location, device, updated_time]);
            let receipt = await methodSend(web3, account, contract.options.jsonInterface, "replyData(uint256,address,bytes)", contract.options.address, [requestId, caller, params]);
    
    
        });
    } catch (err) {
        console.error("error deploying babyFormulaStatusOracle contract");
        console.error(err);
    }
    
})();