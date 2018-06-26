var express = require("express");
var myParser = require("body-parser");
var app = express();
app.use(myParser.json());

var fs = require('fs');
var solc = require('solc');
var Web3 = require("web3");
var web3 = new Web3('https://api.myetherapi.com/rop');

var requestValidator = require("./validators/requestValidator.js");

const mainAddress = "0xa7c74f8b8bea1b5d8ddfb436763857a93693b287";
const mainKey = "0xedcdfd133ad376c5fbf5bd05a7619ac8cfdcc9dddd4befbd52b9f7d662ff19a4";


module.exports = {
    start: function() {

        app.post("/token", function(request, response) {

            if(requestValidator.validateTokenRequest(request)) {

                web3.eth.getTransaction(request.body['txhash']).then(function (tx) {

                    if (tx.from.toUpperCase() == request.body['address'].toUpperCase() && tx.to.toUpperCase() == mainAddress.toUpperCase() && Number(tx.value) >= 10000000000000000) {


                        var form = request.body['form'];

                        var input = fs.readFileSync('./contracts/token.sol');

                        var contractName = form['symbol'].replace(/^\d+/, '').toLowerCase().replace(/^(.)/, function($1) { return $1.toUpperCase(); }) + 'Token';

                        var code = input.toString()
                            .replace(/\{\{SYMBOL\}\}/g, form['symbol'].toUpperCase())
                            .replace(/\{\{ADDRESS\}\}/g, request.body['address'])
                            .replace(/\{\{NAME\}\}/g, form['name'])
                            .replace(/\{\{TOTAL_SUPPLY\}\}/g, toFixed(form['totalSupply']))
                            .replace(/\{\{DECIMALS\}\}/g, form['decimals'])
                            .replace(/\{\{CONTRACT_NAME\}\}/g, contractName);


                        var output = solc.compile(code, 1);

                        var bytecode = output.contracts[':' + contractName].bytecode;

                        var abi = JSON.parse(output.contracts[':' + contractName].interface);

                        var contract = new web3.eth.Contract(abi);


                        web3.eth.estimateGas({
                            data: '0x' + bytecode
                        })
                            .then(function(gas) {
                                web3.eth.getTransactionCount(mainAddress)
                                    .then(function (nonce) {
                                        console.log(nonce);
                                        return web3.eth.accounts.signTransaction(
                                            {
                                                nonce: nonce,
                                                data: '0x' + bytecode,
                                                gas: gas
                                            },
                                            mainKey
                                        );
                                    })
                                    .then(function(signature) {
                                        console.log(signature.rawTransaction);

                                        web3.eth.sendSignedTransaction(signature.rawTransaction)
                                            .on('transactionHash', function (hash) {
                                                console.log('transactionHash', hash);
                                            })
                                            .on('receipt', function (receipt) {
                                                console.log('receipt', receipt);

                                                response.status(200).send(receipt);
                                            })
                                            .on('confirmation', function (confirmationNumber, receipt) {
                                                console.log('confirmation');
                                                console.log(confirmationNumber);
                                                console.log(receipt);
                                            })
                                            .on('error', function (err) {
                                                console.error(err);
                                                response.status(500).send();
                                            });

                                    })
                                    .catch(function (error) {
                                        console.error(error);
                                        response.status(500).send();
                                    });
                            })
                            .catch(function (error) {
                                console.error(error);
                                response.status(500).send(error);
                            });


                    } else {
                        response.status(403).send();
                    }


                }).catch(function (err) {
                    console.error(err);
                    response.status(500).send();
                });

            } else {
                response.status(400).send('Bad Request');
            }



        });

        //Start the server and make it listen for connections on port 8080

        app.listen(3000);
    }


};

function toFixed(x) {
    if (Math.abs(x) < 1.0) {
        var e1 = parseInt(x.toString().split('e-')[1]);
        if (e1) {
            x *= Math.pow(10,e1-1);
            x = '0.' + (new Array(e1)).join('0') + x.toString().substring(2);
        }
    } else {
        var e2 = parseInt(x.toString().split('+')[1]);
        if (e2 > 20) {
            e2 -= 20;
            x /= Math.pow(10,e2);
            x += (new Array(e2+1)).join('0');
        }
    }
    return x;
}