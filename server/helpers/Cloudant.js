/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";

    var Cloudant = require("../configs/cloudant").init;

    module.exports = function (collectionName) {
        Cloudant.db.create(collectionName, function (err, res) {
                if (err) {
                        console.info('Database '+ collectionName + ' already exists');
                }
        });

        var db = Cloudant.db.use(collectionName);
        return {
        	"auth" : function(){
        		//return "auth";
        		return Cloudant.exportedCredentials;
        	},
        	"endpoint": Cloudant.endpoint,
            "create": function (payload) {
                return new Promise(function (resolve, reject) {
                    db.insert(payload, function(err, data) {
                        if (err) {
                            reject(err);
                        }
                        resolve(data);
                    });
                });
            },
            "update": function (doc, id) {
                return new Promise(function (resolve, reject) {
                    db.insert(doc, id, function(err, data) {
                        if (err) {
                            reject(err);
                        }
                        resolve(data);
                    });
                });
            },
            "get": function (query) {
                return new Promise(function (resolve, reject) {

                    if (!query) {
                        return reject("Invalid query");
                    }

                    db.find(query, function (err, items) {
                        if (err) {
                            reject({
                                "status": 500,
                                "message": err
                            });
                        }
                        resolve(items);
                    });
                });
            },
            "getAll": function (params) {
                return new Promise(function (resolve, reject) {
                    db.list(params, function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            },
            "search": function (designDoc, index, queryParams) {
                return new Promise(function (resolve, reject) {
                	//https://examples.cloudant.com/lobby-search/_design/lookup/index.html
                    if (!designDoc || !index || !queryParams) {
                        return reject("Invalid query or input parameters");
                    }

                    db.search(designDoc, index, queryParams, function (err, items) {
                        if (err) {
                            reject({
                                "status": 500,
                                "message": err
                            });
                        }
                        resolve(items);
                    });
                });
            },
            "delete": function (docId, docRev) {
                return new Promise(function (resolve, reject) {
                    db.destroy(docId, docRev, function (err) {
                        if (err) {
                            reject(err);
                        }
                        resolve(["Document:", docId, "from:", collectionName, "deleted successfully"].join(" "));
                    });
                });
            },
            "bulkInsert": function (docs) {
                return new Promise(function (resolve, reject) {

                    if (typeof docs !== "object") {
                        return reject("invalid payload");
                    }

                    db.bulk(docs, function (err) {
                        if (err) {
                            reject(err);
                        }
                        resolve("All documents inserted successfully");
                    });
                });
            }
        };

    };

}());