var express = require("express");
var myParser = require("body-parser");
var app = express();
app.use(myParser.json());


var requestValidator = require("./validators/requestValidator.js");
var tokenContractCreator = require("./contractCreators/tokenContractCreator.js");


module.exports = {
    start: function(port) {

        app.get("/ping", function(request, response) {
            response.status(200).send("hello world");
        });

        app.post("/token", function(request, response) {

            if(tokenContractCreator.validate(request)) {

                requestValidator.validatePayment(request.body['txhash'], request.body['address'])
                    .then(function (valid) {
                       if (valid) {
                           tokenContractCreator.create(request)
                               .then(function(receipt) {
                                   response.status(200).send(receipt);
                               })
                               .catch (function(error){
                                   console.error(error);
                                   response.status(500).send();
                               });

                       } else {
                           // transaction is not valid, forbidden to access
                           response.status(403).send();
                       }
                    }).catch(function (err) {
                        console.error(err);
                        response.status(500).send();
                    });

            } else {
                // input contains error
                response.status(400).send('Bad Request');
            }

        });

        //Start the server and make it listen for connections on port 8080

        app.listen(port);
    }


};
