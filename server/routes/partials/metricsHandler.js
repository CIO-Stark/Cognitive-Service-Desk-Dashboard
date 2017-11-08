/**
 * Created by ricardo gil
 * Provider API Metrics
 * 
 * It contains the endpoints for the dashboard of metrics
 */
(function () {
    "use strict";
    
    var request = require('request');
    var fs = require('fs');
    

    module.exports = function (app, cloudantFeedbackFactory, cloudantUsersFactory) {
	var charts = require('./utils/charts.js')(cloudantFeedbackFactory);
    	
    	/*var feedbackCollection = {
                "hr_module": CloudantFactory("saintpaul-feedback"),
		"access_module": CloudantFactory("saintpaul-access")
        };*/
    	
    	
        /**
         * return json used to create Watson Accuracy by topic
         */
        app.get("/metricsAccuracy/:groupLevel/:startDate/:endDate/:topAmount", function (req, res) {
        	get(req, res, req.params.groupLevel, cloudantFeedbackFactory, true, null, req.params.topAmount)
    		.then(function successCB(data) {
    			return res.status(200).send(data || []);
	        }, function errorCB(err) {
	            return res.status(500).send(err);
	        });
        	
        });
        
        /**
         * return json used to create graphics that represents Users accessed the tool
         */
        /*app.get("/metricsUsers/:groupLevel/:startDate/:endDate", function (req, res) {
        	get(req, res, "userCount", feedbackCollection)
    		.then(function successCB(data) {
    			return res.status(200).send(data || []);
		        }, function errorCB(err) {
		            return res.status(500).send(err);
		        });
        	
        });*/
        app.get("/metricsUsers/:groupLevel/:startDate/:endDate", function (req, res) {
        	var query = {
                	  "selector": {
                    	    "timestamp": {}
                	  },
                    	  "sort": [
                    	    {
                    	      "timestamp": "asc"
                    	    }
                    	  ]
                    	}
        	
        	query.selector.timestamp.$gt = Number(req.params.startDate);
        	query.selector.timestamp.$lt = Number(req.params.endDate);
        	
        	get(req, res, "userCount", cloudantUsersFactory, false, query)
    		.then(function successCB(data) {
    			return res.status(200).send(data || []);
		        }, function errorCB(err) {
		            return res.status(500).send(err);
		        });
        	
        });
        
        ;
        
        
        app.get("/metricsFeedback/:group/:startDate/:endDate", function (req, res) {
        	get(req, res, "feedbackTracking", feedbackCollection)
    		.then(function successCB(data) {
    			return res.status(200).send(data || []);
	        }, function errorCB(err) {
	            return res.status(500).send(err);
	        });
        	
        });
        
        app.get("/metricsTrackFeedback/:group/:startDate/:endDate", function (req, res) {
        	var query = {
                	  "selector": {
                    	    "feedbackDate": {},
                    	    "feedbackStatus" : "negative"
                    	  },
                    	  "sort": [
                    	    {
                    	      "feedbackDate": "asc"
                    	    }
                    	  ]
                    	};
        	query.selector.feedbackDate.$gt = Number(req.params.startDate);
        	query.selector.feedbackDate.$lt = Number(req.params.endDate);
        	
        	get(req, res, "feedbackTracking", cloudantFeedbackFactory, false, query )
        		.then(function successCB(data) {
        			var ret = JSON.parse(data);
        			console.log("ret: " + ret);
        			for(var i in ret)
        				if(ret[i].key == "1")
        					ret[i].key = 'Intencões treinadas'; //TODO fix in18!!!!!
        				else if(ret[i].key == "2")
        					ret[i].key ='Diálogos atualizados'; 
        		  		else if(ret[i].key == "3")
        		  			ret[i].key = 'Erro de usuário'; 
        		  		else if(ret[i].key == "4")
        		  			ret[i].key = 'Não é problema'; 
        		  		else if(ret[i].key == "5")
        		  			ret[i].key = 'False negative'; 
        		  	else ret[i].key = '-';
        		  		
        			return res.status(200).send(ret || []);
            }, function errorCB(err) {
                return res.status(500).send(err);
            });
        	
        });
        
        app.get("/metricsCountry/:group/:startDate/:endDate", function (req, res) {
		var query = {
                	  "selector": {
                    	    "feedbackDate": {}
                    	  },
                    	  "sort": [
                    	    {
                    	      "feedbackDate": "asc"
                    	    }
                    	  ]
                };
		query.selector.feedbackDate.$gt = Number(req.params.startDate);
        	query.selector.feedbackDate.$lt = Number(req.params.endDate);

        	get(req, res, "country", cloudantUsersFactory, false, query)
    		.then(function successCB(data) {
    			return res.status(200).send(data || []);
	        }, function errorCB(err) {
	            return res.status(500).send(err);
	        	
	        });
        });
        
        app.get("/metricsPlatform/:group/:startDate/:endDate", function (req, res) {
        	get(req, res, "browser", cloudantFeedbackFactory)
    		.then(function successCB(data) {
    			return res.status(200).send(data || []);
    		}, function errorCB(err) {
    			return res.status(500).send(err);
        	
    		});
        });
        
        /**
         * increment amount of users who used the widget
         */
        app.post("/incrementUsers", function (req, res) {
        	res.setHeader('Access-Control-Allow-Origin', '*');
        	var jsonRequest = { "type" : "access",
        						"userCount" : "user",
        						"feedbackDate" : new Date().getTime()
        	};
        	
        	cloudantUsersFactory.create(jsonRequest).then(
        			function successCB(data) {
        				return res.status(201).send({"status": "ok"});
    		        }, function errorCB(err) {
    		                return res.status(500).send(err);
    		        });
    					
    		});

			//set routes
			app.get("/metrics/topIntents/:startDate/:endDate/:limit", function(req, res){
				charts.topIntents({
					startDate: Number(req.params.startDate),
					endDate: Number(req.params.endDate),
					limit: Number(req.params.limit)
				}).then(function(data){
					res.send(data);    
				}).catch(function(error){
					res.send({
					status: false,
					message: error.message
					});
				});
				
				
				
			});
        
        
    };
    
    /**
     * using the resObj (json from database), it will group by day, first day of any week or first day of any month
     * The group for count purpose will be based on groupKey
     * For instance: feedbackStatus: positive / negative
     * It will return grouped by date and key
     * 
     * For cases like user count, the key is always the same (instead of positive/negative it will be a fixed value)
     * 
     * @param resObj
     * @param group
     * @param groupKey
     * @returns
     */
    function generateGroupedMetricForKey(resObj, group, groupKey){
    	try {
        	var resp = [];
            var itemList = {};
            
            // First iterate to create the unique Keys
        	for(var i in resObj){
        		var row = resObj[i];
        		if(!itemList[row[groupKey]])
        			itemList[row[groupKey]] = row[groupKey];
        	}
        	console.log("itemlist: " + JSON.stringify(itemList));
            	
        	// with the unique Keys found, iterate to create the multiple values for each one
        	for(var i in itemList){
        		var obj = {};
        		obj.key = itemList[i];
        		obj.values = [];
        		var dateList = {};
        		
        		for(var j in resObj){ // iterate documents from cloudant and "group" date values manually
        			var row = resObj[j];
        			var dateKey = Number(row.feedbackDate);
        			if(group == 'grpMonth'){
        				// get first day of month for display and grouping
        				dateKey = new Date(new Date(row.feedbackDate).getFullYear(), new Date(row.feedbackDate).getMonth(), 1).getTime();
        				console.info("First day of month:" + new Date(dateKey));
        			}else if(group == 'grpWeek'){
        				// get Monday of week for display and grouping
        				dateKey = getMonday(new Date(dateFormat(new Date(row.feedbackDate))+'T12:00:00Z')).getTime();
        			}else{
        				dateKey = new Date(dateFormat(new Date(row.feedbackDate))+'T12:00:00Z').getTime();
        			}
        			
        			if(row[groupKey] == itemList[i]){ // if equals unique key values found above, get the values
            			if(!dateList[dateKey])
            				dateList[dateKey] = 1;
            			else dateList[dateKey]++;
            			
            		} 
        		}
        		
        		console.log("datelist: " + JSON.stringify(dateList));
        		for(var key in dateList){
        			var value = {};
        			value.x = key;
        			value.y = dateList[key];
        			obj.values.push(value);
        		}
        		resp.push(obj);
        	}
            console.info("generateGroupedMetricForKey JSON:" + JSON.stringify(resp));
            return JSON.stringify(resp);
    	} catch(e){
    		console.error(e);
    		return [];
    	}
    }
    
	/**
	 * Returns the final json with data ready to be presented in the dashboard accuracy graphics
	 * @param {*} resObj 
	 * @param {*} group 
	 * @param {*} groupKey 
	 */
    function generateGroupedAccuracyMetricForKey(resObj, groupKey, limit){
    	console.info("generateGroupedAccuracyMetricForKey Input: " + JSON.stringify(resObj,null, 2));
    	try {
        	var resp = [];
            var itemList = {};
	    	let data = [];
            
            // First iterate to create the unique Keys of Intents
	    	resObj.forEach(feedbackDoc => {
				feedbackDoc.chatHistory.forEach(chat => {
					chat.intents.forEach(intent => {
					if(!itemList[intent.intent]){
						itemList[intent.intent] = {intent: intent.intent,
									count: 1}
						data.push(itemList[intent.intent]);
					}
					else itemList[intent.intent].count++;
					});
					

				});
	    	});
			//console.log("itemlist: " + JSON.stringify(itemList));
			data.sort(function(a, b){//order by count desc
					return b.count - a.count;
				});
				data = data.splice(0, limit || 5);
			itemList = {}; // replace spliced arrar into json object to use "exists" function easily
			data.forEach(intent =>{
			itemList[intent.intent] = intent;
			});

	    
        	/*for(var i in resObj){
        		var chats = resObj[i].chatHistory;
        		for(var chatKey in resObj[i].chatHistory)
        			for(var k in resObj[i].chatHistory[chatKey].intents)
        				if(!itemList[resObj[i].chatHistory[chatKey].intents[k].intent])
        					itemList[resObj[i].chatHistory[chatKey].intents[k].intent] = 
        						resObj[i].chatHistory[chatKey].intents[k].intent;
        	}*/
        	//console.log("itemlist: " + JSON.stringify(itemList));
            	
        	// with top Limit of the unique Keys found, iterate each intention of each chatHistory
			let uniqueDateKey = {}; // all the keys must have the same amount of axis (x) for the stack bar graphic
        	data.forEach(intent =>{
				var obj = {};
					obj.key = intent.intent;
					obj.values = [];
					var dateList = {};

				resObj.forEach(feedbackDoc => {
					var dateKey;
					if(feedbackDoc.hasOwnProperty("chatHistory"))
						feedbackDoc.chatHistory.forEach(chat =>{
							if(chat.intents.length) //must have intents, otherwise are the questions
								if(chat.intents[0].intent === intent.intent){ //only get data for the top intents
									if(groupKey == 'grpMonth'){
										// get first day of month for display and grouping
										dateKey = new Date(new Date(feedbackDoc.feedbackDate).getFullYear(), new Date(feedbackDoc.feedbackDate).getMonth(), 1).getTime();
										console.info("First day of month:" + new Date(dateKey));
									}else if(groupKey == 'grpWeek'){
										// get Monday of week for display and grouping
										dateKey = getMonday(new Date(dateFormat(new Date(feedbackDoc.feedbackDate))+'T12:00:00Z')).getTime();
									}else{
										dateKey = new Date(dateFormat(new Date(feedbackDoc.feedbackDate))+'T12:00:00Z').getTime();
									}

									if(!dateList[dateKey])
		            					dateList[dateKey] = {"count" : 1};
		            				else dateList[dateKey].count++;

									/**
									 * this is to make sure all the keys have all the same
									 * amount of values - this is for the cummulative graph
									 */
									if(!uniqueDateKey[dateKey])
										uniqueDateKey[dateKey] = {date: new Date(Number(dateKey))};
		        				
								}
						});
				});

				for(var key in dateList){
        			let value = {};
        			value.x = key;
        			value.y = dateList[key].count;
					value.date = new Date(Number(key));
        			obj.values.push(value);
				}
				obj.values.sort(function(a, b){//order by count desc
					return a.x - b.x;
				});

				resp.push(obj);
			});

			resp.forEach(obj => {
				for(let key in uniqueDateKey){
					let exists = false;
					obj.values.forEach(value =>{
						if(value.x === key){
							exists = true;
							return;
						}
					});
					// if uniqueKey does not exists, add to the obj.values
					if(!exists)
						obj.values.push({
							x : key,
							y : 0
						});

					// order the array so it will present nicely in the screen
					obj.values.sort(function(a, b){
						return a.x - b.x;
					});
				}
			});
		
		/*for(var i in itemList){
        		var obj = {};
        		obj.key = itemList[i];
        		obj.values = [];
        		var dateList = {};
        		
        		for(var j in resObj){ // iterate documents from cloudant and "group" date values manually
        			var row = resObj[j];
        			var dateKey = Number(row.feedbackDate);
        			if(group == 'grpMonth'){
        				// get first day of month for display and grouping
        				dateKey = new Date(new Date(row.feedbackDate).getFullYear(), new Date(row.feedbackDate).getMonth(), 1).getTime();
        				console.info("First day of month:" + new Date(dateKey));
        			}else if(group == 'grpWeek'){
        				// get Monday of week for display and grouping
        				dateKey = getMonday(new Date(dateFormat(new Date(row.feedbackDate))+'T12:00:00Z')).getTime();
        			}else{
        				dateKey = new Date(dateFormat(new Date(row.feedbackDate))+'T12:00:00Z').getTime();
        			}
        			
        			for(var chatKey in row.chatHistory)
            			for(var intentKey in row.chatHistory[chatKey].intents)
		        			if(row.chatHistory[chatKey].intents[intentKey].intent == itemList[i]){ // if equals unique key values found above, get the values
		            			
		        				if(!dateList[dateKey])
		            				dateList[dateKey] = {"sum": row.chatHistory[chatKey].intents[intentKey].confidence, "count" : 1};
		            			else dateList[dateKey] = {"sum": dateList[dateKey].sum + row.chatHistory[chatKey].intents[intentKey].confidence, 
		            										"count" : dateList[dateKey].count + 1};
		        				
		            		}
		            			
		        } 
        		
        		
        		console.log("datelist: " + JSON.stringify(dateList, null, 2));
        		dateList.forEach(grpDate => {
				obj.values.push({
					x: grpDate,
					y: dateList[grpDate].sum / dateList[grpDate].count
				})
			});
				
        		resp.push(obj);
        	}*/
            //console.info("generateGroupedAccuracyMetricForKey JSON:" + JSON.stringify(resp));
            return JSON.stringify(resp);
    	} catch(e){
    		console.error(e);
    		return [];
    	}
    }
    
    /**
     * Gets the json from database and converts to a friendly format for a generic multiBarChart 
    example of database response for this method is basically: Key,day,weekly,monthly and its values
    
    count If true, will get count otherwise sum/count
    
    {"rows":[
	 		{"key":["Chrome","2017-03-07"],"value":{"sum":3,"count":3,"min":1,"max":1,"sumsqr":3}},
	 		{"key":["Chrome","2017-04-07"],"value":{"sum":1,"count":1,"min":1,"max":1,"sumsqr":1}},
	 		{"key":["Firefox","2017-03-07"],"value":{"sum":1,"count":1,"min":1,"max":1,"sumsqr":1}}
	  		]}
	  		
	  example of JSON for multiBarChart [{"key":"Metric","values":[{"x":data,"y":valor}]],[...]
   */
    function createFriendlyJSON(resObj, groupLevel, count){
    	console.info("createFriendlyJSON4MultiBarChart Input: " + resObj);
    	try {
        	var resp = [];
            var itemList = {};
            
            if(!resObj.rows){
            	console.info("No rows for %j", resObj);
            	return [];
            }
            
        	// First iterate to create the unique Keys
            // Format is: ["2017-03-07","key",10(week),3(month)]
        	for(var i in resObj.rows){
        		var row = resObj.rows[i];
        		
        		if(!itemList[row.key[1]])
        			itemList[row.key[1]] = row.key[1];
        	}
            	
        	// with the unique Keys found, iterate to create the multiple values for each one
        	for(var i in itemList){
        		console.info("Item:" + itemList[i]);
        		var obj = {};
        		obj.key = itemList[i];
        		obj.values = [];
        		for(var j in resObj.rows){
        			var row = resObj.rows[j];
            		if(row.key[1] == itemList[i]){ // if equals unique key values found above, get the values
            			var value = {};
            			// the x value can be: day, week or month and it is based on group_level query parameter
            			// the -1 is because group level of db index[] starts with 2(day)
            			if(groupLevel == 2) 
            				value.x = row.key[0]; //get the day which is always first
            			else	            			
            				value.x = row.key[groupLevel -1];
	            		
	            		// for COUNT values, sum will return = COUNT from query
	            		// and for values that must be divided SUM/COUNT it will work as well
	            		if(count)
	            			value.y = row.value.count;
	            		else value.y = row.value.sum / row.value.count; 
	            		
            			obj.values.push(value);
            		} 
        		}
        		resp.push(obj);
        	}
            console.info("createFriendlyJSON:" + JSON.stringify(resp));
            return JSON.stringify(resp);
    	} catch(e){
    		console.error(e);
    		console.info("ddsdsiijdsjds");
    		return [];
    	}
    }
    
	/**
	 * Query for the documents that matches the parameters like date and groupBy
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} groupKey The key where data will grouped against
	 * @param {*} feedbackCollection Indicates the Database name
	 * @param {*} accuracy when True, it goes to the logic that handles the accuracy data (different than others since 
	 * accuracy data are inside inner array of the document)
	 * @param {*} query Specific or generic query for the search
	 */
    function get(req, res, groupKey, cloudantFactory, accuracy, query, topAmount ){
    	return new Promise(function (resolve, reject) {
    		
    		
            console.info("Metric Query for: Start Date: " + new Date(Number(req.params.startDate)) + 
            				", End Date: " + new Date(Number(req.params.endDate)));
            
            if(isNaN(req.params.startDate || req.params.endDate))
        		return res.status(500).send('Invalid date');
            
            var q;
            if(query) q = query;
            else{
            	q	= {            
                	  "selector": {
                    	    "feedbackDate": {},
                    	    "type" : 'feedback'
                    	  },
                    	  "sort": [
                    	    {
                    	      "feedbackDate": "asc"
                    	    }
                    	  ]
                    	};
            	q.selector.feedbackDate.$gt = Number(req.params.startDate);
            	q.selector.feedbackDate.$lt = Number(req.params.endDate); 
            }
            console.log(JSON.stringify(q));
            /** 
             * query cloudant
             */
            cloudantFactory.get(q).then(function successCB(feedbackList) {
            	/**
            	 * the accuracy graphic follows a complete different structure so its logic
            	 * must be individualized
            	 */
            	if(accuracy)
            		resolve(generateGroupedAccuracyMetricForKey(feedbackList.docs || [], groupKey, topAmount));
                resolve(generateGroupedMetricForKey(feedbackList.docs || [], req.params.group, groupKey));
            }, function errorCB(err) {
            	console.error(err);
            	reject([]);
            });
    	});
    }
    		
    
    function getWeekNumber(d) {
        // Copy date so don't modify original
        d = new Date(+d);
        d.setHours(0,0,0,0);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        // Get first day of year
        var yearStart = new Date(d.getFullYear(),0,1);
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
        return weekNo;
    }
    
    /**
     * return Monday date of the week of param d
     * Used to identify a common value for weeks. So Monday of week x will be grouped for any date
     * of these same week
     * @param d
     * @returns
     */
    function getMonday(d) {
    	  d = new Date(d);
    	  var day = d.getDay(),
    	      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    	  return new Date(d.setDate(diff));
    }
    
	/**
	 * returns date format yyyy-mm-dd for the charts label
	 * @param date
	 * @returns
	 */
	function dateFormat(date){
		var day = date.getDate();
		day = day < 10 ? '0'+ day : day;
		
		var monthIndex = date.getMonth();
		monthIndex = (monthIndex + 1) < 10 ? '0'+(monthIndex +1) : (monthIndex +1);
		
		var year = date.getFullYear();
		
		return year + '-' + monthIndex + '-' + day;
	}
    

}());