/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";

    module.exports = function (app, apiDocs) {
        app.get("/api-docs", function (req, res) {
            return res.status(200).json(apiDocs);
        });

        app.get("/doc", function (req, res) {
            return res.status(200).render("../doc/swagger/dist/index.html", null);
        });
    };

}());