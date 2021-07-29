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

    var cmd0 = shellArgs[0];
    // To Init database
    if (cmd0 == "init") {
        console.log("Database Table Creating ... ");

        var sqlCommand = `
        CREATE TABLE IF NOT EXISTS key_events (
        id int(10) NOT NULL auto_increment,
        track_id int(10) NOT NULL,
        address varchar(100) NOT NULL,
        location varchar(100) NOT NULL,
        temperature float(30) NOT NULL,
        device varchar(100) NOT NULL,
        updated_time datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
        );
        `

        await db.query(
            sqlCommand, []
        );

        sqlCommand = `
        CREATE TABLE IF NOT EXISTS hashed_certificates (
        id int(10) NOT NULL auto_increment,
        address varchar(100) NOT NULL,
        certification MEDIUMTEXT NOT NULL,
        updated_time datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
        );
        `

        await db.query(
            sqlCommand, []
        );

        console.log("Database Tables Created ");

        process.exit();
    }

    else if (cmd0 == "create") {
        if (shellArgs.length < 2) {
            console.error("e.g. node index.js deploy oracle");
            process.exit(1);
        }
        if (shellArgs[1] == "babyFormula") {
            try {
                let account = getAccount(web3, "sender");
                let loaded = loadCompiledSols(["oracle", "BabyFormula"]);
                let contract = await deployContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, []);
                console.log("Baby Formula address: " + contract.options.address);
            } catch (err) {
                console.error("error deploying babyFormula contract");
                console.error(err);
            }
        } else if (shellArgs[1] == "babyFormulaTransit") {
            if (shellArgs.length < 6) {
                console.error("need to specify Receiver Address, Baby Formula oracle address and at least one Baby Formula");
            } else {
                let receiver = shellArgs[2];
                let receiptFileLocation = shellArgs[3];
                let oracleAddr = shellArgs[4];
                let babyFormulaAddresses = shellArgs.slice(5);
                try {
                    let account = getAccount(web3, "sender");
                    let loaded = loadCompiledSols(["oracle", "BabyFormula"]);
                    let contract = await deployContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, [oracleAddr, receiver]);

                    // inserting random data to database
                    var locations = ["Sydney", "Melbourne", "Brisbane", "Melton", "Busselton", "Tamworth", "Central Coast", "Hobart", "Launceston", "Rockhampton", "Devonport", "Lismore", "Armidale", "Gympie", "Griffith", "Yeppoon", "Wangaratta"];
                    var equipments = ["Raw milk reception area", "Pasteurizer and Homogeniser", "Falling film Evaporator", "Spray dryer", "Cold storage tanks", "Centrifugal separator", "UHT sterilization system", "Filling system", " Packing machine", "CIP Cleaning System", "Hygienic Pumps", "Oil Blending"];
                    let maximum = 25;
                    let minimum = 0;
                    let counter = 0;
                    do {
                        counter += 1;
                        var sql: string = 'INSERT into key_events(address, track_id, location, temperature, device) values (? , ? , ? , ?, ?)';
                        var randomLocation = locations[Math.floor(Math.random() * locations.length)];
                        var randomEquipment = equipments[Math.floor(Math.random() * equipments.length)];
                        var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
                        db.query(
                            sql, [contract.options.address, counter, randomLocation, randomnumber, randomEquipment]
                        );
                    } while (counter < 5)

                    let content = "";

                    try {
                        const fileData = fs.readFileSync(receiptFileLocation, 'utf8');
                        content = new Buffer(fileData).toString('base64');
                        var sql = 'INSERT into hashed_certificates (address, certification) values (?, ?)'
                        db.query(
                            sql, [contract.options.address, content], (err: never, result: any) => {
                                if (err) throw err;
                            }
                        );

                    } catch {
                        console.error('Could not read receipt file');
                    }

                    if (content) {
                        let i = 0;
                        for (let j = 50000; j < content.length; j = j + 50000) {
                            console.log('Saving receipt Chunk...');
                            let slicedString = content.slice(i, j);
                            await methodSend(web3, account, contract.options.jsonInterface, "addReceipt(string)", contract.options.address, [slicedString]);
                            i = j;
                        }
                    }

                    for (var i = 0; i < babyFormulaAddresses.length; i++) {
                        console.log("Adding Baby Formula to Transit");
                        await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, contract.options.address, "addBabyFormula(address)", [babyFormulaAddresses[i]]);
                        await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, babyFormulaAddresses[i], "setTransit(address)", [contract.options.address]);
                    }
                    
                    console.log("Baby Formula Transit contract address: " + contract.options.address);
                } catch (err) {
                    console.error("error deploying babyFormulaTransit contract");
                    console.error(err);
                }
            }
        }
        web3Provider.disconnect(1000, 'Normal Closure');
        process.exit();
    }
})();