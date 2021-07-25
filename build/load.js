"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCompiledSols = void 0;
var fs = require('fs');
var solc = require('solc');
function findImports(importPath) {
    try {
        return {
            contents: fs.readFileSync("smart_contracts/" + importPath, 'utf8')
        };
    }
    catch (e) {
        return {
            error: e.message
        };
    }
}
function loadCompiledSols(solNames) {
    ;
    var sources = {};
    solNames.forEach(function (value, index, array) {
        var a_file = fs.readFileSync("smart_contracts/" + value + ".sol", 'utf8');
        sources[value] = {
            content: a_file
        };
    });
    var input = {
        language: 'Solidity',
        sources: sources,
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    var compiler_output = solc.compile(JSON.stringify(input), { import: findImports });
    var output = JSON.parse(compiler_output);
    return output;
}
exports.loadCompiledSols = loadCompiledSols;
