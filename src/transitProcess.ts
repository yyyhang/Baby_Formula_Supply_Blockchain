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

    if (shellArgs[0] === 'startTransit') {
        if (shellArgs.length < 3) {
            console.error("wrong number of arguments");
            process.exit(1);
        }
        try {
            let accountId = shellArgs[1];
            let account = getAccount(web3, accountId);
            let loaded = loadCompiledSols(["oracle", "BabyFormula"]);

            let transitAddress = shellArgs[2];
            await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, transitAddress, "startTransit()", []);

        } catch (err) {
            console.error("error Starting babyFormulaTransit contract");
            console.error(err);
        }
    } else if (shellArgs[0] === 'runTransit') {
        if (shellArgs.length < 3) {
            console.error("wrong number of arguments");
            process.exit(1);
        }
        try {
            let accountId = shellArgs[1];
            let account = getAccount(web3, accountId);
            let loaded = loadCompiledSols(["oracle", "BabyFormula"]);

            let transitAddress = shellArgs[2];

            for (let counter = 0; counter < 5; counter++) {
                await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, transitAddress, "getBabyFormulaStatus()", []);
            }
            await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, transitAddress, "endTransit()", []);
        } catch (err) {
            console.error("error Starting babyFormulaTransit contract");
            console.error(err);
        }
    }
    web3Provider.disconnect(1000, 'Normal Closure');
    process.exit();
})();