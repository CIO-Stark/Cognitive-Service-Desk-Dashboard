/**
 * Created by ricardo gil
 * Provider API Metrics
 * 
 * It contains the endpoints for the admin dashboard of metrics
 */
(function () {
	"use strict";

	var request = require('request');
	


	module.exports = function (app, cloudantFactory) {
		var charts = require('./utils/charts.js')(cloudantFactory);
		var insights = require('./utils/insights.js')(cloudantFactory);

		app.get("/adminMetrics/allInsights/:startDate/:endDate", (req, res) => {
			insights.allInsights({
				startDate: Number(req.params.startDate),
				endDate: Number(req.params.endDate)			
			}).then(function(data){
				res.send(data);    
			}).catch(function(error){
				res.send({
				status: false,
				message: error.message
				});
			});
			
		});

		/**
         * Retrieve all documents to get platform of access
         */
        app.get("/adminMetrics/findPlatformTotal/:startDate/:endDate", function (req, res) {
            console.info("findPlatformTotal: Start Date: " + new Date(Number(req.params.startDate)) + 
    				", End Date: " + new Date(Number(req.params.endDate)));

            var query = {
                            "selector": {
                                "feedbackDate": {}, "type" : "feedback"
                            },
                                "fields": ["platform", "feedbackDate"]
                        };
            query.selector.feedbackDate.$gt = Number(req.params.startDate);
            query.selector.feedbackDate.$lt = Number(req.params.endDate);
            
            cloudantFactory.get(query).then(feedbackList => {
                let web =0, mobile = 0;
                feedbackList.docs.forEach(element =>{
                    if(element.hasOwnProperty("platform"))
                        element.platform == 'web'? web++ : mobile++;
                });
                return res.status(200).send([{key:"Web", y: web}, {key:"Mobile", y:mobile}]);
            }, err => {
                return res.status(500).send(err);
            });
        });

		/**
		 * return data needed for the intent X feedback report
		 */
		app.get("/adminMetrics/intentsAndFeedbacks/:intent/:startDate/:endDate", (req, res) => {
			let q = {
				"selector": {
					"feedbackDate": {},
					"type": "feedback"
				},
				"sort": [{
					"feedbackDate": "asc"
				}],
				"fields": ["chatHistory", "feedbackStatus", "feedbackDate"]
			};
			q.selector.feedbackDate.$gt = Number(req.params.startDate);
			q.selector.feedbackDate.$lt = Number(req.params.endDate);



			get(req, res, q)
				.then(data => {
					let intents = {};
					let finalResp = [];

					data.forEach(row => {
						if (row.chatHistory)
							row.chatHistory.forEach(chatEntry => {
								if (chatEntry.userId && chatEntry.userId == 'watson'){ //watson answers
									// intents are array of 0 position
									if (!chatEntry.intents.length) return;

									// only return data for the input intent (or all if empty)
									if(req.params.intent !== '-')
										if(chatEntry.intents[0].intent !== req.params.intent)
											return;

									if(!intents[chatEntry.intents[0].intent]) {
										intents[chatEntry.intents[0].intent] = {
											count: 1,
											intent: chatEntry.intents[0].intent,
											confidence: chatEntry.intents[0].confidence,
											positiveCount: row.feedbackStatus == "positive" ? 1 : 0,
											negativeCount: row.feedbackStatus == "positive" ? 0 : 1
										};
										finalResp.push(intents[chatEntry.intents[0].intent]);
									} else {
										/**
										 * if confidence exists, sum count and update the confidence avg
										 * --- dont ask me why I did not got the avg directly from the DB!
										 */
										intents[chatEntry.intents[0].intent].count++;
										intents[chatEntry.intents[0].intent].confidence += chatEntry.intents[0].confidence;
										//intents[chatEntry.intents[0].intent].confidence = intents[chatEntry.intents[0].intent].confidence / intents[chatEntry.intents[0].intent].count;
										intents[chatEntry.intents[0].intent].positiveCount += row.feedbackStatus == "positive" ? 1 : 0;
										intents[chatEntry.intents[0].intent].negativeCount += row.feedbackStatus == "positive" ? 0 : 1
									}
								}
							})
					});

					/**
					 * receive raw data from database and convert to the d3 graph format
					 * resp ex: [{"count":1,"intent":"oq_lair","confidence":0.827174186706543,"positiveCount":1,"negativeCount":0},
					 * 			 {"count":1,"intent":"ativo_nao_circulante","confidence":0.7582229375839233,"positiveCount":1,"negativeCount":0}]]
					 */
					let finalData = [];

					let positive = {	
											key: 'positive',
											values: [],
											yAxis: 2, 
											type: "line", 
											originalKey: "positive"
					};
					let negative = {	
											key: 'negative',
											values: [],
											yAxis: 2, 
											type: "line", 
											originalKey: "negative"
					};
					let intentsResp = {	
											key: 'Intenções',
											values: [],
											yAxis: 1, 
											type: "bar", 
											originalKey: "Intenções"
					};
					let i = 0;
					finalResp.forEach(intent => {
						let posValues = {
												x: i,
												y: intent.positiveCount,
												series: 0,
												label: intent.intent
											};
						positive.values.push(posValues);

						let negValues = {
												x: i,
												y: intent.negativeCount,
												series: 0,
												label: intent.intent
											};
						negative.values.push(negValues);

						let intentValues = {
												x: i++,
												y: intent.confidence/intent.count,
												series: 0,
												label: intent.intent
											};

						intentsResp.values.push(intentValues);
						/**
						 * handle d3 graphic issues, when there is only one set of data,
						 * it starts showing from top to botton. If we add a second set with
						 * 0 value, it presents correctly
						 */
						if(req.params.intent !== '-')
							intentsResp.values.push({
												x: i-1,
												y: 0,
												series: 0,
												label: intent.intent
											});

					});
					if(i > 0){
						finalData.push(positive);
						finalData.push(negative);
						finalData.push(intentsResp);
						//finalData.push(finalResp);
					}
					/*$scope.data = [
						{
							"key": "positive", "values": [{ "x": 0, "y": 1, "series": 0 },
							{ "x": 1, "y": 2, "series": 0 },
							{ "x": 2, "y": 3, "series": 0 },
							{ "x": 3, "y": 4, "series": 0 }],
							"yAxis": 2, "type": "line", "originalKey": "positive"
						},

						{
							"key": "neg", "values": [{ "x": 0, "y": 5, "series": 0 },
							{ "x": 1, "y": 5, "series": 0 },
							{ "x": 2, "y": 2, "series": 0 },
							{ "x": 3, "y": 5, "series": 0 }],
							"yAxis": 2, "type": "line", "originalKey": "neg"
						},

						{
							"key": "Intenções", "values": [{ "x": 0, "y": 0.86, "series": 0, "label": "intencao1" },
							{ "x": 1, "y": 0.91, "series": 0, "label": "intencao2" },
							{ "x": 2, "y": 0.95, "series": 0, "label": "intencao3" },
							{ "x": 3, "y": 0.60, "series": 0, "label": "intencao4" }],
							"yAxis": 1, "type": "bar", "originalKey": "Intenções"
						},

					];*/



					return res.status(200).send(JSON.stringify(finalData, null, 2) || []);
				}), (err => {
					return res.status(500).send(err);
				});


		});


		/**
		 * return list of questions, its confidence and feedback per intention 
		 */
		app.get("/adminMetrics/intentsReport/:intent/:startDate/:endDate", (req, res) => {
			let q = {
				"selector": {
					"feedbackDate": {},
					"type": "feedback"
				},
				"sort": [{
					"feedbackDate": "asc"
				}],
				"fields": ["chatHistory", "feedbackStatus", "feedbackDate", "userID"]
			};
			q.selector.feedbackDate.$gt = Number(req.params.startDate);
			q.selector.feedbackDate.$lt = Number(req.params.endDate);

			get(req, res, q)
				.then(data => {
					let finalData = [];
					data.forEach(row => {
						if (row.chatHistory)
							row.chatHistory.forEach((chatEntry, index) => {
								// intents are array of 0 position
								if (!chatEntry.intents.length) return;

								// for the same intents
								if(chatEntry.intents[0].intent == req.params.intent){
									// get the answer that caused intention, it MUST be prior chatEntry
									finalData.push({
															question: row.chatHistory[index -1].text,
															feedbackStatus: row.feedbackStatus,
															confidence: chatEntry.intents[0].confidence,
															feedbackDate: row.feedbackDate,
															userID : row.userID
									})
								}
							});
					});
					return res.status(200).send(JSON.stringify(finalData, null, 2) || []);
				}), (err => {
					return res.status(500).send(err);
				});


		});

		/**
		 * return list of questions, its confidence and feedback per intention 
		 */
		app.get("/adminMetrics/findAllIntents/:startDate/:endDate", (req, res) => {
			console.log("called /adminMetrics/findAllIntents");
			let q = {
				"selector": {
					//"feedbackDate": {},
					"type": "feedback"
				},
				"sort": [{
					"feedbackDate": "asc"
				}],
				"fields": ["chatHistory", "feedbackDate"]
			};
			//q.selector.feedbackDate.$gt = Number(req.params.startDate);
			//q.selector.feedbackDate.$lt = Number(req.params.endDate);

			get(req, res, q)
				.then(data => {
					console.log("getData", data.length);
					let finalData = [];
					let uniqueKeys = {}
					
					data.forEach(row => {
						try{
							if (row.chatHistory)
								row.chatHistory.forEach((chatEntry, index) => {
									// intents are array of 0 position
									if (!chatEntry.intents.length) return;

									// for the same intents
									if(!uniqueKeys[chatEntry.intents[0].intent]){
										console.log("including intent", chatEntry.intents[0].intent);
										uniqueKeys[chatEntry.intents[0].intent] = 1;
										finalData.push(chatEntry.intents[0].intent);
									}
									
								});
						} catch(err){
							console.error("catch", err);
						}
					});
					return res.status(200).send(JSON.stringify(finalData.sort(), null, 2) || []);
				}), (err => {
					console.error("finalAllIntents", err);
					return res.status(500).send(err);
				});


		});

		//set routes
		app.get("/adminMetrics/wordcloud/:intent/:startDate/:endDate", function(req, res){
			let intent = req.params.intent || false;
			if(intent){
			charts.wordcloud({
				startDate: Number(req.params.startDate),
				endDate: Number(req.params.endDate),
				intent: intent
			}).then(function(data){
				res.send({
				status: true,
				dataLength: data.length,
				data: data
				});    
			}).catch(function(error){
				res.send({
				status: false,
				message: error.message
				});
			});
			}
			else{
			res.send({
				status: false,
				message: "wordcloud error: missing intent"
			})
			}
		});


		function get(req, res, query) {
			return new Promise((resolve, reject) => {

				console.info("Metric Query for: Start Date: " + new Date(Number(req.params.startDate)) +
					", End Date: " + new Date(Number(req.params.endDate)));

				if (isNaN(req.params.startDate || req.params.endDate))
					return res.status(500).send('Invalid date');


				console.log(JSON.stringify(query));
				/** 
				 * query cloudant
				 */
				cloudantFactory.get(query).then(data => {
					resolve(data.docs || []);
				}), (err => {
					console.error(err);
					reject([]);
				});
			});
		}

	}



}());