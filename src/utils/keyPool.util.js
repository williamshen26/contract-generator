require('../constants/constant.js');

var Web3 = require("web3");
var Observable = require("rxjs");
require("rxjs/add/operator/take.js");
require("rxjs/add/operator/switchMap.js");
var web3 = new Web3();

var accountPool = [];

for (var i = 0; i < global.keyPool.length; i++) {
    accountPool.push({index: i, key: global.keyPool[i], account: web3.eth.accounts.privateKeyToAccount(global.keyPool[i]).address, available: true});
}

console.log(accountPool);


module.exports = {
    waitForKey: function () {
        return Observable.timer(0, 5000).take(5)
            .switchMap(function() {
               return getKey();
            });
    },

    freeKey: function(account) {
        accountPool[account.index].available = true;
    }
};

function getKey() {
    for (var i = 0; i < accountPool.length; i++) {

        if (accountPool[i].available) {
            accountPool[i].available = false;
            return Observable.of(accountPool[i]);
        }

    }
    return Observable.empty();
}