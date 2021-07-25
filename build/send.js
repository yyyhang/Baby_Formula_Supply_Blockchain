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
Object.defineProperty(exports, "__esModule", { value: true });
exports.methodSend = void 0;
var Helper = /** @class */ (function () {
    function Helper() {
    }
    Helper.gasPay = function (gas) {
        return Math.ceil(gas * Helper.gas_mulptiplier);
    };
    Helper.gas_mulptiplier = 1.2;
    return Helper;
}());
function methodSend(web3, account, abi, methodName, address, args) {
    return __awaiter(this, void 0, void 0, function () {
        var a_contract, gasPrice, gas, _a, _b, _c, _d;
        var _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    a_contract = new web3.eth.Contract(abi, address, {});
                    return [4 /*yield*/, web3.eth.getGasPrice().then(function (averageGasPrice) {
                            // console.log("Average gas price: " + averageGasPrice);
                            gasPrice = averageGasPrice;
                        }).catch(console.error)];
                case 1:
                    _h.sent();
                    return [4 /*yield*/, web3.eth.getBalance(account.address).then(function (account_balance) {
                            // console.log("Gas in wallet: " + account_balance);
                        }).catch(function (err) {
                        })];
                case 2:
                    _h.sent();
                    _b = (_a = (_e = a_contract.methods)[methodName].apply(_e, args)).send;
                    _f = {
                        from: account.address,
                        gasPrice: gasPrice
                    };
                    _d = (_c = Helper).gasPay;
                    return [4 /*yield*/, (_g = a_contract.methods)[methodName].apply(_g, args).estimateGas({ from: account.address })];
                case 3: 
                // console.log("sending...");
                return [2 /*return*/, _b.apply(_a, [(_f.gas = _d.apply(_c, [_h.sent()]),
                            _f)]).then(function (receipt) {
                        return receipt;
                    }).catch(function (ee) {
                        console.error(ee);
                    })];
            }
        });
    });
}
exports.methodSend = methodSend;
