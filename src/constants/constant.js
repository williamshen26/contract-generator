var fs = require("fs");
var Web3 = require("web3");
var web3 = new Web3();

var secureData = JSON.parse(fs.readFileSync('./properties/secure.json').toString());
var data = JSON.parse(fs.readFileSync('./properties/data.json').toString());

global.mainKey = secureData['mainKey'];
global.mainAddress = web3.eth.accounts.privateKeyToAccount(global.mainKey).address;
global.web3Provider = data['web3Provider'];

console.log(global.mainKey);
console.log(global.mainAddress);
console.log(global.web3Provider);