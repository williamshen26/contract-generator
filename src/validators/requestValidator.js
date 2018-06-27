require('../constants/constant.js');

var Web3 = require("web3");
var web3 = new Web3(global.web3Provider);


module.exports = {
    validatePayment: function (txHash, fromAddress) {

        return new Promise(function (resolve, reject) {
            web3.eth.getTransaction(txHash).then(function (tx) {
                if (tx.from.toUpperCase() == fromAddress.toUpperCase() && tx.to.toUpperCase() == global.mainAddress.toUpperCase() && Number(tx.value) >= 10000000000000000) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(function (err) {
                console.error(err);
                reject(err);
            });
        });
    }
};