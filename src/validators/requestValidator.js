var Web3 = require("web3");
var web3 = new Web3();

module.exports = {
    validateTokenRequest: function (request) {

        if(request.body['txhash'] && request.body['address']) {
            if (web3.utils.isHex(request.body['txhash']) && web3.utils.isAddress(request.body['address'])) {
                return true;
            }
        }

        return false;
    }
};