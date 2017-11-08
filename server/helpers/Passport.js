/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";

    var LocalStrategy = require("passport-local").Strategy;

    module.exports = function (passport, cloudantFactory) {
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });

        passport.use(new LocalStrategy(
            function (username, password, done) {
                
                // this DEMO accepts the hardcoded credentials but you should implement your own user authorization
                // TODO
                if (username === "admin" && password == "123") {
                    return done(null, "admin");
                } else {
                    return done(null, false, {
                        "message": "Incorrect credentials"
                    });
                }
            }
        ));
    };
}());