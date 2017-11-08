/**
 * Created by danielabrao on 1/31/17.
 */
/*jslint node:true*/
(function () {
    "use strict";
    module.exports = function (app, passport, isLoggedIn) {

        app.get("/auth/logout", function (req, res) {
            req.logout();
            res.redirect("/");
        });
    };

}());