/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";
    var Cloudant = require("cloudant"),
        credentials = {
            "username": JSON.parse(process.env.VCAP)["cloudantNoSQLDB"][0].credentials.username,
            "password": JSON.parse(process.env.VCAP)["cloudantNoSQLDB"][0].credentials.password, 
            "endpoint": JSON.parse(process.env.VCAP)["cloudantNoSQLDB"][0].credentials.host 
        };

    module.exports = {
        "init": new Cloudant({
            "account": credentials.username,
            "password": credentials.password
        }, function (err) {
            if (err) {
                console.log("error connecting to DB " + err);
            } else {
                console.log("connection success");
            }
        }),
        "exportedCredentials": new Buffer([credentials.username, credentials.password].join(":")).toString("base64"),
        "endpoint" : credentials.endpoint
    };
}());