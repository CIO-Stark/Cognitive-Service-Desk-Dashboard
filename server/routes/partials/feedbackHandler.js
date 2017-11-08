/**
 * Class responsible for the feedback operations like sendFeedback, retrieve, etc
 */
(function () {
    "use strict";
    var request = require('request');
    module.exports = function (app, cloudantFactory) {

        
        /**
         * Send the feedback message to database
         */
        app.post("/sendFeedback", function (req, res) {
        	res.setHeader('Access-Control-Allow-Origin', '*');
            if (!req.body.feedback) {
                return res.status(403).send("Can not proceed without feedback object");
            }

            if (!feedbackCollection.hasOwnProperty(req.query.module)) {
                return res.status(404).send("Requested module is not available");
            }
            var jsonRequest = JSON.parse(req.body.feedback);
            /**
             * getting Client IP and its location
             * freegeoip is a free open service - but we cannot garantee it will always work
             * in case of failure will save 'unknown' country
             */
            var ip = req.connection.remoteAddress;
        	request.get(
        			{	
    					url: 'http://freegeoip.net/json/'+ req.connection.remoteAddress,
    		 			headers: {
    		 				'Accept': 'application/json'
    		 			}
    				}, 
    			function (err, response, body) {
    					if(err){
    						console.error("Error while getting location:" + err);
    						jsonRequest.country = 'unknown';
    					}else{
    						console.info("FreeGeoip call:" + body);
    						if(JSON.parse(body).country_name)
    							jsonRequest.country = JSON.parse(body).country_name;
    						else jsonRequest.country = 'unknown';
    					}
    					
    					jsonRequest.userCount = 'User'; // for user metric counting, keep this static value
    					jsonRequest.feedbackDate = new Date().getTime();
    					jsonRequest.type = 'feedback'; //identify in DB the type of document
    					
    					console.info("json:  ", JSON.stringify(jsonRequest));
    					feedbackCollection[req.query.module].create(jsonRequest).then(function successCB(data) {
    		                return res.status(201).send(data);
    		            }, function errorCB(err) {
    		                return res.status(500).send(err);
    		            });
    					
    			});
            	
            
        });

        /**
         * Retrieve all documents where type=Feedback considering start and EndDates
         */
        app.get("/listFeedback/:startDate/:endDate", function (req, res) {
            
            console.info("Feedback Query for: Start Date: " + new Date(Number(req.params.startDate)) + 
    				", End Date: " + new Date(Number(req.params.endDate)));

            var query = {
              	  "selector": {
              		"feedbackDate": {}, "type" : "feedback"
              	  },
                  	  "sort": [
                  	    {
                  	      "feedbackDate": "asc"
                  	    }
                  	  ]
                  	};
            query.selector.feedbackDate.$gt = Number(req.params.startDate);
            query.selector.feedbackDate.$lt = Number(req.params.endDate);
            
            cloudantFactory.get(query).then(function successCB(feedbackList) {
                return res.status(200).send(feedbackList.docs || []);
            }, function errorCB(err) {
                return res.status(500).send(err);
            });
        });

        /**
         * Retrieve all documents where type=Feedback considering start and EndDates
         */
        app.get("/findFeedbacksTotal/:startDate/:endDate", function (req, res) {
            console.info("Feedback Query for: Start Date: " + new Date(Number(req.params.startDate)) + 
    				", End Date: " + new Date(Number(req.params.endDate)));

            var query = {
                            "selector": {
                                "feedbackDate": {}, "type" : "feedback"
                            },
                                "fields": ["feedbackStatus", "feedbackDate"]
                        };
            query.selector.feedbackDate.$gt = Number(req.params.startDate);
            query.selector.feedbackDate.$lt = Number(req.params.endDate);
            
            cloudantFactory.get(query).then(feedbackList => {
                let positive =0, negative = 0;
                feedbackList.docs.forEach(element =>{
                    if(element.hasOwnProperty("feedbackStatus"))
                        element.feedbackStatus == 'positive'? positive++ : negative++;
                });
                return res.status(200).send([{key:"Positivo", y: positive}, {key:"Negativo", y:negative}]);
            }, err => {
                return res.status(500).send(err);
            });
        });

        app.post("/queryFeedback", function (req, res) {
            if (!feedbackCollection.hasOwnProperty(req.query.module)) {
                return res.status(404).send("Requested module is not available");
            }

            feedbackCollection[req.query.module].get({
                "selector":  req.body.filters || {}
            }).then(function successCB(feedbackList) {
                return res.status(200).send(feedbackList.docs || []);
            }, function errorCB(err) {
                return res.status(500).send(err);
            });
        });
        
        app.post("/updateFeedback", function (req, res) {
            if (!feedbackCollection.hasOwnProperty(req.query.module)) {
                return res.status(404).send("Requested module is not available");
            }
            var id = req.query.id;
            var status = req.query.status;
            console.log(id);
            console.log(status);
            var query = {
                	  "selector": {
                    	    "_id": id
                	  	},
                    	  "sort": [
                    	    {
                    	      "feedbackDate": "asc"
                    	    }
                    	  ]
                    	};
              console.log(query);
              feedbackCollection[req.query.module].get(query).then(function successCB(doc) {
            	  if(doc.docs[0]){
            		  var json = doc.docs[0];
            		  json.feedbackTracking = status; 
            		  console.log(json);  
            		  
            		  feedbackCollection[req.query.module].update(json, json._id).then(function successCreate(createDoc) {
            			  return res.status(200).send(createDoc || []);
            		  }, function errorCreate(errCreate){
            			  console.error(errCreate);
            			  return res.status(500).send(errCreate);
            		  });
            	  }
              }, function errorCB(err) {
                  return res.status(500).send(err);
              });
            
            
        });
        
    }

}());