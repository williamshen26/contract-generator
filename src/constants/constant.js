var fs = require("fs");
var Web3 = require("web3");
var web3 = new Web3();

var secureData = JSON.parse(fs.readFileSync('./properties/secure.json').toString());
var data = JSON.parse(fs.readFileSync('./properties/data.json').toString());

global.mainAddress = secureData['mainAddress'];
global.web3Provider = data['web3Provider'];
global.keyPool = secureData['keyPool'];

console.log(global.mainAddress);
console.log(global.web3Provider);