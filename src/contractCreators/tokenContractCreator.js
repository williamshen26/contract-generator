var Web3 = require("web3");
var web3 = new Web3();
var compiler = require("../compilers/solidityCompiler");
var fs = require("fs");

var contractUtil = require("../utils/contract.util");

module.exports = {
    validate: function (request) {

        if(request.body['txhash'] && request.body['address'] && request.body['form']) {
            if (web3.utils.isHex(request.body['txhash']) && web3.utils.isAddress(request.body['address'])) {
                return true;
            }
        }

        return false;
    },

    create: function (request) {
        return new Promise(function (resolve, reject) {
            var form = request.body['form'];

            var input = fs.readFileSync('./contracts/token.sol');

            var contractName = form['symbol'].replace(/^\d+/, '').toLowerCase().replace(/^(.)/, function ($1) {
                    return $1.toUpperCase();
                }) + 'Token';

            var code = input.toString()
                .replace(/\{\{SYMBOL\}\}/g, form['symbol'].toUpperCase())
                .replace(/\{\{ADDRESS\}\}/g, request.body['address'])
                .replace(/\{\{NAME\}\}/g, form['name'])
                .replace(/\{\{TOTAL_SUPPLY\}\}/g, contractUtil.toFixed(form['totalSupply']))
                .replace(/\{\{DECIMALS\}\}/g, form['decimals'])
                .replace(/\{\{CONTRACT_NAME\}\}/g, contractName);

            compiler.compile(code, contractName)
                .then(function(receipt) {
                    resolve(receipt);
                }).catch (function(err) {
                    reject(err);
                });

        });
    }
};