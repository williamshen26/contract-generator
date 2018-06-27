var server = require("./src/server.js");

var port = 3000;

if (process.argv.length == 3) {
    port = process.argv[2];
}

server.start(port);