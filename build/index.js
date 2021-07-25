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
var fs = require("fs");
var solc = require("solc");
var axios = require("axios").default;
var db = require("./db");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    function findImports(importPath) {
        try {
            return {
                contents: fs.readFileSync("smart_contracts/" + importPath, "utf8")
            };
        }
        catch (e) {
            return {
                error: e.message
            };
        }
    }
    function compileSols(solNames) {
        ;
        var sources = {};
        solNames.forEach(function (value, index, array) {
            var sol_file = fs.readFileSync("smart_contracts/" + value + ".sol", "utf8");
            sources[value] = {
                content: sol_file
            };
        });
        var input = {
            language: "Solidity",
            sources: sources,
            settings: {
                outputSelection: {
                    "*": {
                        "*": ["*"]
                    }
                }
            }
        };
        var compiler_output = solc.compile(JSON.stringify(input), {
            import: findImports
        });
        var output = JSON.parse(compiler_output);
        return output;
    }
    var web3Provider, web3, sqlCommand, account, compiled, contract_instance, gasPrice, contract, _a, _b, _c, _d, _e;
    var _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                web3Provider = new web3_1.default.providers.WebsocketProvider("ws://localhost:7545");
                web3 = new web3_1.default(web3Provider);
                sqlCommand = "\n    CREATE TABLE IF NOT EXISTS key_envents (\n    id int(10) NOT NULL auto_increment,\n    location varchar(100) NOT NULL,\n    temperature float(30) NOT NULL,\n    device varchar(100) NOT NULL,\n    certificates varchar(10000) NOT NULL,\n    updated_time datetime DEFAULT CURRENT_TIMESTAMP,\n    PRIMARY KEY (id)\n    );\n    ";
                db.query(sqlCommand, [], function (err, result) {
                    if (err)
                        throw err;
                    console.log("Table created");
                });
                account = web3.eth.accounts.wallet.add("0x" + "9b35d32a3dcefaec076c6b7186a58e1fb34a3ae462a4227ba80d4dd87a8d3c65");
                compiled = compileSols(["example"]);
                contract = new web3.eth.Contract(compiled.contracts["example"]["CoatIndicator"].abi, undefined, {
                    data: "0x" + compiled.contracts["example"]["CoatIndicator"].evm.bytecode.object
                });
                return [4 /*yield*/, web3.eth.getGasPrice().then(function (averageGasPrice) {
                        gasPrice = averageGasPrice;
                    }).catch(console.error)];
            case 1:
                _g.sent();
                _b = (_a = contract.deploy({
                    data: contract.options.data,
                    arguments: [account.address]
                })).send;
                _f = {
                    from: account.address,
                    gasPrice: gasPrice
                };
                _d = (_c = Math).ceil;
                _e = 1.2;
                return [4 /*yield*/, contract.deploy({
                        data: contract.options.data,
                        arguments: [account.address]
                    }).estimateGas({
                        from: account.address
                    })];
            case 2: 
            // assume account balance is sufficient
            return [4 /*yield*/, _b.apply(_a, [(_f.gas = _d.apply(_c, [_e * (_g.sent())]),
                        _f)]).then(function (instance) {
                    contract_instance = instance;
                }).catch(console.error)];
            case 3:
                // assume account balance is sufficient
                _g.sent();
                console.log(contract_instance.options.address);
                // listen
                contract_instance.events["temperatureRequest(string)"]()
                    .on("connected", function (subscriptionId) {
                    console.log("listening on event temperatureRequest");
                })
                    .on("data", function (event) {
                    return __awaiter(this, void 0, void 0, function () {
                        var city, temperature, _a, _b, _c, _d, _e, e_1;
                        var _f;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    city = event.returnValues.city;
                                    console.log(city);
                                    return [4 /*yield*/, axios.get("https://goweather.herokuapp.com/weather/" + city)
                                            .then(function (response) {
                                            var _a, _b;
                                            return __awaiter(this, void 0, void 0, function () {
                                                return __generator(this, function (_c) {
                                                    return [2 /*return*/, (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.temperature) === null || _b === void 0 ? void 0 : _b.replace(/[^0-9-\.]/g, "")];
                                                });
                                            });
                                        })
                                            .catch(function (error) {
                                            console.log(error);
                                        })];
                                case 1:
                                    temperature = _g.sent();
                                    if (!parseInt(temperature)) {
                                        console.log("invalid temperature");
                                        return [2 /*return*/];
                                    }
                                    _g.label = 2;
                                case 2:
                                    _g.trys.push([2, 4, , 5]);
                                    _b = (_a = contract_instance.methods["responsePhase(int256)"](temperature)).send;
                                    _f = {
                                        from: account.address,
                                        gasPrice: gasPrice
                                    };
                                    _d = (_c = Math).ceil;
                                    _e = 1.2;
                                    return [4 /*yield*/, contract_instance.methods["responsePhase(int256)"](temperature).estimateGas({ from: account.address })];
                                case 3:
                                    _b.apply(_a, [(_f.gas = _d.apply(_c, [_e * (_g.sent())]),
                                            _f)]).then(function (receipt) {
                                        5;
                                        return receipt;
                                    }).catch(function (err) {
                                        console.error(err);
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_1 = _g.sent();
                                    console.log(e_1);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                })
                    .on("error", function (error, receipt) {
                    console.log(error);
                    console.log(receipt);
                    console.log("error listening on event temperatureRequest");
                });
                return [2 /*return*/];
        }
    });
}); })();
