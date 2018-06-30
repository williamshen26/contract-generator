require('../constants/constant.js');

var solc = require('solc');
var Web3 = require("web3");
var web3 = new Web3(global.web3Provider);

module.exports = {
    compile: function (code, contractName, account) {

        return new Promise(function (resolve, reject) {

            var output = solc.compile(code, 1);

            var bytecode = output.contracts[':' + contractName].bytecode;

            var abi = JSON.parse(output.contracts[':' + contractName].interface);

            var contract = new web3.eth.Contract(abi);


            web3.eth.estimateGas({
                data: '0x' + bytecode
            })
                .then(function (gas) {
                    web3.eth.getTransactionCount(account.account)
                        .then(function (nonce) {
                            console.log(nonce);
                            return web3.eth.accounts.signTransaction(
                                {
                                    nonce: nonce,
                                    data: '0x' + bytecode,
                                    gas: gas
                                },
                                account.key
                            );
                        })
                        .then(function (signature) {
                            console.log(signature.rawTransaction);

                            web3.eth.sendSignedTransaction(signature.rawTransaction)
                                .on('transactionHash', function (hash) {
                                    console.log('transactionHash', hash);
                                })
                                .on('receipt', function (receipt) {
                                    console.log('receipt', receipt);

                                    resolve(receipt);
                                })
                                .on('confirmation', function (confirmationNumber, receipt) {
                                    console.log('confirmation');
                                    console.log(confirmationNumber);
                                    console.log(receipt);
                                })
                                .on('error', function (err) {
                                    console.error(err);
                                    reject(err);
                                });

                        })
                        .catch(function (error) {
                            console.error(error);
                            reject(error);
                        });
                })
                .catch(function (error) {
                    console.error(error);
                    reject(error);
                });
        });
    }
};