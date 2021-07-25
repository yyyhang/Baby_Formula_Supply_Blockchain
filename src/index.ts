import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
import { callDeployedContract, deployContract } from './deploy';
import { handleRequestEvent } from './listen';
import { loadCompiledSols } from './load';
import { methodSend } from './send';
import { Contract } from 'web3-eth-contract';
let fs = require('fs');

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

var shellArgs = process.argv.slice(2);
if (shellArgs.length < 1) {
    console.error("node programName cmd, e.g. node index.js deploy");
    process.exit(1);
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

    var cmd0 = shellArgs[0];

    if (cmd0 == "deploy") {
        if (shellArgs.length < 2) {
            console.error("e.g. node index.js deploy oracle");
            process.exit(1);
        }
        if (shellArgs[1] == "babyFormula") {
            try {
                let account = getAccount(web3, "user");
                let loaded = loadCompiledSols(["BabyFormula"]);
                let contract = await deployContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, []);
                console.log("BabyFormula address: " + contract.options.address);
            } catch (err) {
                console.error("error deploying contract");
                console.error(err);
            }
        } else if (shellArgs[1] == "CargoShipTransitOracle") {
            try {
                let account = getAccount(web3, "ship1");
                let loaded = loadCompiledSols(["oracle", "CargoShipTransitOracle"]);
                let contract = await deployContract(web3!, account, loaded.contracts["CargoShipTransitOracle"]["CargoShipTransitOracle"].abi, loaded.contracts["CargoShipTransitOracle"]["CargoShipTransitOracle"].evm.bytecode.object, [account.address]);
                console.log("oracle contract address: " + contract.options.address);
            } catch (err) {
                console.error("error deploying contract");
                console.error(err);
            }
        } else if (shellArgs[1] == "babyFormulaTransit") {
            if (shellArgs.length < 4) {
                console.error("need to specify ship oracle address and at least one baby formula");
            } else {
                let oracleAddr = shellArgs[2];
                let babyFormulaAddresses = shellArgs.slice(3);
                try {
                    let account = getAccount(web3, "user");
                    let loaded = loadCompiledSols(["oracle", "BabyFormula", "BabyFormulaTransit"]);
                    let contract = await deployContract(web3!, account, loaded.contracts["BabyFormulaTransit"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormulaTransit"]["BabyFormulaTransit"].evm.bytecode.object, [oracleAddr]);
                    console.log("Baby Formula Transit contract address: " + contract.options.address);
                    
                    for (var i = 0; i < babyFormulaAddresses.length; i++) {
                        await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, babyFormulaAddresses[i], "setTransit(address)" , [contract.options.address]);
                    }
                
                } catch (err) {
                    console.error("error deploying contract");
                    console.error(err);
                }
            }
        }
        web3Provider.disconnect(1000, 'Normal Closure');
    } else if (cmd0 == "listen") {
        if (shellArgs.length < 3) {
            console.error("e.g. node index.js listen oracle 0x23a01...");
            process.exit(1);
        }
        if (shellArgs[1] == "oracle") {
            let account!: Account;
            let contract!: Contract;
            try {
                account = getAccount(web3, "ship1");
                let loaded = loadCompiledSols(["oracle", "CargoShipTransitOracle"]);
                let contractAddr = shellArgs[2];
                contract = new web3.eth.Contract(loaded.contracts["CargoShipTransitOracle"]["CargoShipTransitOracle"].abi, contractAddr, {});
            } catch (err) {
                console.error("error listening oracle contract");
                console.error(err);
            }
            handleRequestEvent(contract, async (caller: String, requestId: Number, data: any) => {
                //let cities = web3.eth.abi.decodeParameters(['string', 'string'], data);
                //let city1 = cities[0];
                let temperature1 = 15;
                let temperatureHex1!: String;
                try {
                    temperatureHex1 = web3.utils.toTwosComplement(temperature1);
                } catch (e) {
                    console.error("invalid temperature grabbed");
                    console.error(e);
                    return;
                }
                //let temperaturesHex = web3.eth.abi.encodeParameters(['uint256', 'uint256'], [temperatureHex1, temperatureHex2]);
                console.log("the temperature is " + temperature1);
                let receipt = await methodSend(web3, account, contract.options.jsonInterface, "replyData(uint256,address,bytes)", contract.options.address, [requestId, caller, temperatureHex1]);
            });
        }

    }
})();