/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";

    require("dotenv").config({silent: true});
    var express = require("express"),
        app = express(),
        path = require("path"),
        cfenv = require("cfenv"),
        appEnv = cfenv.getAppEnv(),
        fs = require("fs"),
        engines = require('consolidate'),
        ejs = require("ejs"),
        request = require("request"),
        bodyParser = require("body-parser"),
        passport = require("passport"),
        cookieSession = require("cookie-session"),
        cookieParser = require("cookie-parser"),
        compress = require("compression"),
        server = require("http").createServer(app),
        morgan = require("morgan"),
        cloudantFeedbackFactory = require("./server/helpers/Cloudant")("smeboard-feedback"),
        cloudantFeedbackUsersFactory = require("./server/helpers/Cloudant")("smeboard-access");
        
       

    app.engine("html", engines.ejs);
    app.set("views", __dirname + "/public/views/");
    app.set("view engine", "html");
    app.use(express.static(path.join(__dirname, "./public/")));
    app.use(compress());
    app.use(morgan("dev"));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({limit: "50mb"}));
    app.use(cookieSession({
        secret: "appSecretKey",
        maxAge: 86400000
    }));

    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());

    require("./server/helpers/Passport")(passport, cloudantFeedbackFactory);
    require("./server/routes/index.script")(app, passport, cloudantFeedbackFactory, cloudantFeedbackUsersFactory);

    server.listen(appEnv.port, appEnv.bind, function () {
        console.log(appEnv.url);
    });

}());