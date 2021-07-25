"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
var deploy_1 = require("./deploy");
var listen_1 = require("./listen");
var load_1 = require("./load");
var send_1 = require("./send");
var fs = require('fs');
function initializeProvider() {
    try {
        var provider_data = fs.readFileSync('eth_providers/providers.json');
        var provider_json = JSON.parse(provider_data);
        var provider_link = provider_json["provider_link"];
        return new web3_1.default.providers.WebsocketProvider(provider_link);
    }
    catch (error) {
        throw "Cannot read provider";
    }
}
function getAccount(web3, name) {
    try {
        var account_data = fs.readFileSync('eth_accounts/accounts.json');
        var account_json = JSON.parse(account_data);
        var account_pri_key = account_json[name]["pri_key"];
        return web3.eth.accounts.wallet.add('0x' + account_pri_key);
    }
    catch (error) {
        throw "Cannot read account";
    }
}
var shellArgs = process.argv.slice(2);
if (shellArgs.length < 1) {
    console.error("node programName cmd, e.g. node index.js deploy");
    process.exit(1);
}
(function run() {
    return __awaiter(this, void 0, void 0, function () {
        var web3Provider, web3, cmd0, account, loaded, contract, err_1, account, loaded, contract, err_2, oracleAddr, babyFormulaAddresses, account, loaded, contract, i, err_3, account_1, contract_1, loaded, contractAddr;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    try {
                        web3Provider = initializeProvider();
                        web3 = new web3_1.default(web3Provider);
                    }
                    catch (e) {
                        throw "web3 cannot be initialized";
                    }
                    cmd0 = shellArgs[0];
                    if (!(cmd0 == "deploy")) return [3 /*break*/, 20];
                    if (shellArgs.length < 2) {
                        console.error("e.g. node index.js deploy oracle");
                        process.exit(1);
                    }
                    if (!(shellArgs[1] == "babyFormula")) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    account = getAccount(web3, "user");
                    loaded = load_1.loadCompiledSols(["BabyFormula"]);
                    return [4 /*yield*/, deploy_1.deployContract(web3, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, [])];
                case 2:
                    contract = _a.sent();
                    console.log("BabyFormula address: " + contract.options.address);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("error deploying contract");
                    console.error(err_1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 19];
                case 5:
                    if (!(shellArgs[1] == "CargoShipTransitOracle")) return [3 /*break*/, 10];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    account = getAccount(web3, "ship1");
                    loaded = load_1.loadCompiledSols(["oracle", "CargoShipTransitOracle"]);
                    return [4 /*yield*/, deploy_1.deployContract(web3, account, loaded.contracts["CargoShipTransitOracle"]["CargoShipTransitOracle"].abi, loaded.contracts["CargoShipTransitOracle"]["CargoShipTransitOracle"].evm.bytecode.object, [account.address])];
                case 7:
                    contract = _a.sent();
                    console.log("oracle contract address: " + contract.options.address);
                    return [3 /*break*/, 9];
                case 8:
                    err_2 = _a.sent();
                    console.error("error deploying contract");
                    console.error(err_2);
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 19];
                case 10:
                    if (!(shellArgs[1] == "babyFormulaTransit")) return [3 /*break*/, 19];
                    if (!(shellArgs.length < 4)) return [3 /*break*/, 11];
                    console.error("need to specify ship oracle address and at least one baby formula");
                    return [3 /*break*/, 19];
                case 11:
                    oracleAddr = shellArgs[2];
                    babyFormulaAddresses = shellArgs.slice(3);
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 18, , 19]);
                    account = getAccount(web3, "user");
                    loaded = load_1.loadCompiledSols(["oracle", "BabyFormula", "BabyFormulaTransit"]);
                    return [4 /*yield*/, deploy_1.deployContract(web3, account, loaded.contracts["BabyFormulaTransit"]["BabyFormulaTransit"].abi, loaded.contracts["BabyFormulaTransit"]["BabyFormulaTransit"].evm.bytecode.object, [oracleAddr])];
                case 13:
                    contract = _a.sent();
                    console.log("Baby Formula Transit contract address: " + contract.options.address);
                    i = 0;
                    _a.label = 14;
                case 14:
                    if (!(i < babyFormulaAddresses.length)) return [3 /*break*/, 17];
                    return [4 /*yield*/, deploy_1.callDeployedContract(web3, account, loaded.contracts["BabyFormula"]["BabyFormula"].abi, loaded.contracts["BabyFormula"]["BabyFormula"].evm.bytecode.object, babyFormulaAddresses[i], "setTransit(address)", [contract.options.address])];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16:
                    i++;
                    return [3 /*break*/, 14];
                case 17: return [3 /*break*/, 19];
                case 18:
                    err_3 = _a.sent();
                    console.error("error deploying contract");
                    console.error(err_3);
                    return [3 /*break*/, 19];
                case 19:
                    web3Provider.disconnect(1000, 'Normal Closure');
                    return [3 /*break*/, 21];
                case 20:
                    if (cmd0 == "listen") {
                        if (shellArgs.length < 3) {
                            console.error("e.g. node index.js listen oracle 0x23a01...");
                            process.exit(1);
                        }
                        if (shellArgs[1] == "oracle") {
                            try {
                                account_1 = getAccount(web3, "ship1");
                                loaded = load_1.loadCompiledSols(["oracle", "CargoShipTransitOracle"]);
                                contractAddr = shellArgs[2];
                                contract_1 = new web3.eth.Contract(loaded.contracts["CargoShipTransitOracle"]["CargoShipTransitOracle"].abi, contractAddr, {});
                            }
                            catch (err) {
                                console.error("error listening oracle contract");
                                console.error(err);
                            }
                            listen_1.handleRequestEvent(contract_1, function (caller, requestId, data) { return __awaiter(_this, void 0, void 0, function () {
                                var temperature1, temperatureHex1, receipt;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            temperature1 = 15;
                                            try {
                                                temperatureHex1 = web3.utils.toTwosComplement(temperature1);
                                            }
                                            catch (e) {
                                                console.error("invalid temperature grabbed");
                                                console.error(e);
                                                return [2 /*return*/];
                                            }
                                            //let temperaturesHex = web3.eth.abi.encodeParameters(['uint256', 'uint256'], [temperatureHex1, temperatureHex2]);
                                            console.log("the temperature is " + temperature1);
                                            return [4 /*yield*/, send_1.methodSend(web3, account_1, contract_1.options.jsonInterface, "replyData(uint256,address,bytes)", contract_1.options.address, [requestId, caller, temperatureHex1])];
                                        case 1:
                                            receipt = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                    }
                    _a.label = 21;
                case 21: return [2 /*return*/];
            }
        });
    });
})();
