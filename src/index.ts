import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
import { callDeployedContract, deployContract } from './deploy';
import { loadCompiledSols } from './load';
import { methodSend } from './send';
let fs = require('fs');
const db = require("./db");
const readlineModule = require('readline');
const crypto = require("crypto");

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
        return web3.eth.accounts.wallet.add('0x' + name);
    } catch (error) {
        throw "Cannot read account";
    }
}

function createRandomData() {
    var locations = ["Sydney", "Melbourne", "Brisbane", "Melton", "Busselton", "Tamworth", "Central Coast", "Hobart", "Launceston", "Rockhampton", "Devonport", "Lismore", "Armidale", "Gympie", "Griffith", "Yeppoon", "Wangaratta"];
    let maximum = 15;
    let minimum = 5;
    var randomLocation = locations[Math.floor(Math.random() * locations.length)];
    var equipment = ''
    var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    return {
        location: randomLocation,
        equipment: equipment,
        temperature: randomnumber,
    }
}

const login = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout
  });

login.question('Enter private key of Producer\n', (answer: string) => {
    let web3Provider!: WebsocketProvider;
    let web3!: Web3;
    try {
        web3Provider = initializeProvider();
        web3 = new Web3(web3Provider);
        console.log(`Web3 initialized`);
    } catch (e) {
        throw "web3 cannot be initialized";
    }

    let account: Account;
    try {
        account = getAccount(web3, answer);
        console.log(`Successfully logged into account: ` + account.address);
        login.close();

        const read = readlineModule.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const start = async () => {
            let allBabyFormulaAddresses = [];
            let loaded = loadCompiledSols(["oracle", "BabyFormula"]);
            console.log('Enter one of the following commands...\ncreateFormula, listFormula, createTransit, startTransit, runTransit');
            for await (const line of read) {
                const lineParts = line.split(' ');
                const lineParams = lineParts.length > 1 ? lineParts.slice(1) : [];
                switch(lineParts[0]) {
                    case 'createFormula':
                        let batchSize = 1;
                        for (const s of lineParams) {
                            const param = s.split('=');
                            if (param.length === 2 && param[0] === '-batchSize' && !isNaN(param[1])) {
                                batchSize = parseInt(param[1]);
                            }
                        }

                        for (let i = 0; i < batchSize; i++) {
                            let contract = await deployContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, []);
                            allBabyFormulaAddresses.push(contract.options.address)
                            console.log("Baby Formula address: " + contract.options.address);
                        }
                        break;
                    case 'createTransit':
                        let receiver = null;
                        let receiptFileLocation = null;
                        let oracleAddr = null;
                        let babyFormulaAddresses = [];
                        for (const s of lineParams) {
                            const param = s.split('=');
                            if (param.length === 2 && param[0] === '-receiver') {
                                receiver = param[1];
                            }
                            if (param.length === 2 && param[0] === '-receiptLocation') {
                                receiptFileLocation = param[1];
                            }
                            if (param.length === 2 && param[0] === '-shipOracle') {
                                oracleAddr = param[1];
                            }
                            if (param.length === 2 && param[0] === '-formula' && !isNaN(param[1])) {
                                babyFormulaAddresses = param[1].split(',');
                            }
                        }
                        if (!receiver || !oracleAddr || babyFormulaAddresses.length === 0) {
                            console.log('***ERROR*** Mandatory parameters missing: receiver, shipOracle, formula');
                        } else {
                            let contract = await deployContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, [oracleAddr, receiver]);
                            
                            let counter = 0;
                            // inserting random data to database
                            do {
                                counter += 1;
                                const data = createRandomData();
                                var sql: string = 'INSERT into key_events(address, track_id, location, temperature, device) values (? , ? , ? , ?, ?)';
                                db.query(
                                    sql, [contract.options.address, counter, data.location, data.temperature, data.equipment]
                                );
                            } while (counter < 5)

                            let content = "";

                            if (receiptFileLocation) {
                                try {
                                    const fileData = fs.readFileSync(receiptFileLocation, 'utf8');
                                    content = new Buffer(fileData).toString('base64');
                                    var sql = 'INSERT into hashed_certificates (address, certification) values (?, ?)'
                                    db.query(
                                        sql, [contract.options.address, content], (err: never, result: any) => {
                                            if (err) throw err;
                                        }
                                    );
                                    const hash = crypto.createHash('sha256').update(content).digest('hex');
                                    console.log('Storing file hash: ' + hash);
                                    await methodSend(web3, account, contract.options.jsonInterface, "addReceipt(string)", contract.options.address, [hash]);

                                } catch {
                                    console.error('***ERROR*** Could not read receipt file');
                                }
                            }
                                    
                            for (var i = 0; i < babyFormulaAddresses.length; i++) {
                                console.log("Adding Baby Formula to Transit");
                                await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, contract.options.address, "addBabyFormula(address)", [babyFormulaAddresses[i]]);
                                await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, babyFormulaAddresses[i], "setTransit(address)", [contract.options.address]);
                            }
                            console.log("Baby Formula Transit contract address: " + contract.options.address);
                        }
                        break;
                    case 'startTransit':
                        let transitAddress = '';
                        for (const s of lineParams) {
                            const param = s.split('=');
                            if (param.length === 2 && param[0] === '-transit') {
                                transitAddress = param[1];
                            }
                        }
                        if (transitAddress) {
                            await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, transitAddress, "startTransit()", []);
                            console.log("Baby Formula transit started");
                        } else {
                            console.error('***ERROR*** Missing Manadatory parameter: transit');
                        }
                        break;
                    case 'runTransit':
                        let transit = '';
                        for (const s of lineParams) {
                            const param = s.split('=');
                            if (param.length === 2 && param[0] === '-transit') {
                                transit = param[1];
                            }
                        }
                        if (transit) {
                            for (let counter = 0; counter < 5; counter++) {
                                await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, transit, "getBabyFormulaStatus()", []);
                            }
                            console.log("Ending Transit...");
                            await callDeployedContract(web3!, account, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormula"]["BabyFormulaTransit"].evm.bytecode.object, transit, "endTransit()", []);
                            console.log("Transit completed");
                        } else {
                            console.error('***ERROR*** Missing Manadatory parameter: transit');
                        }
                        break;
                    case 'listFormula':
                        for (let i = 0; i < allBabyFormulaAddresses.length; i++) {
                            console.log(allBabyFormulaAddresses[i]);
                        }
                        break;
                    default:
                        console.log('Could not recognize command');
                }
                console.log('\nEnter one of the following commands...\ncreateFormula, listFormula, createTransit, startTransit, runTransit');
            }
        }
        start();
    } catch (err) {
        console.error("error could not log in");
        web3Provider.disconnect(1000, 'Normal Closure');
        process.exit();
    }
});