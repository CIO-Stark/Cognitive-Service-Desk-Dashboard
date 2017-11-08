(function () {
    "use strict";
    module.exports = function(db){

    //get data from db
        let loadData = function(filters){
            let query = {
                "selector": {
                    "feedbackDate": { 
                            "$gt" : filters.startDate,
                            "$lt" : filters.endDate
                    },
                    "type" : 'feedback'
                    
                }
            };
            return new Promise(function(resolve, reject){
                db.get(query).then(function(response){
                    resolve(response.docs);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //get intents data matching given filters
        let getIntentsData = function(data, filters){
            let intents = {};
            data.forEach(function(doc){
                if(doc.hasOwnProperty("chatHistory")){
                    doc.chatHistory.forEach(function(message){
                        message.intents.forEach(function(intent){
                            if(!intents.hasOwnProperty(intent.intent)){
                                intents[intent.intent] = 1;
                            }
                            else{
                                intents[intent.intent] = intents[intent.intent] + 1;
                            }
                        });
                    });
                }
            });
            return intents;
        };

    //get sessions with given intent
        let getSessionsData = function(data, filters){
            let sessions = {};
            data.forEach(function(doc){//get sessionsIDs that have filters.intent at least once within its intents
                if(doc.hasOwnProperty("sessionID") && doc.hasOwnProperty("chatHistory") ){
                    doc.chatHistory.forEach(function(message){
                        let matchedIntent = false;
                        message.intents.forEach(function(intent){//check if this chat has given targetIntent, if it does push all its intents
                            if(intent.intent === filters.intent && matchedIntent === false){
                                matchedIntent = true;
                            }
                        });
                        if(matchedIntent){//set session unique identifier property
                            if(!sessions.hasOwnProperty(doc.sessionID)){
                                sessions[doc.sessionID] = {};
                            } 
                        }
                    });
                }
            });
            data.forEach(function(doc){//get all intents for each sessionID selected
               if(doc.hasOwnProperty("sessionID") && doc.hasOwnProperty("chatHistory") && sessions.hasOwnProperty(doc.sessionID)){
                    doc.chatHistory.forEach(function(message){
                        message.intents.forEach(function(intent){//check if this chat messages have the current intent
                            if(!sessions[doc.sessionID].hasOwnProperty(intent.intent)){
                                sessions[doc.sessionID][intent.intent] = 1;
                            }
                            else{
                                sessions[doc.sessionID][intent.intent] = sessions[doc.sessionID][intent.intent] + 1;   
                            }
                        });
                    });
               } 
            });
            return sessions;
        };

    //get wordcloud dataset based on sessions data
        let getWordcloudDataset = function(sessions, targetIntent){
            let dataset = [];
            let intents = {};
            for(let session in sessions){
                for(let intent in sessions[session]){
                    if(!intents.hasOwnProperty(intent)){
                        intents[intent] = sessions[session][intent];
                    }
                    else{
                        intents[intent] = intents[intent] + sessions[session][intent];
                    }
                }
            }
            delete intents[targetIntent];//remove target intent from data
            for(let intent in intents){//create wordcloud dataset from sessions data
                dataset.push([intent, intents[intent]]);
            }
            dataset.sort(function(a, b){//order by count desc
                return b[1] - a[1];
            });
            return dataset;
        };

    //get wordcloud
        let getWordcloud = function(filters){
            return new Promise(function(resolve, reject){
                loadData(filters).then(function(data){
                    let sessions = getSessionsData(data, filters);
                    let dataset = getWordcloudDataset(sessions, filters.intent);
                    resolve(dataset);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //get top intents dataset based on intents data
        let getTopIntentsDataset = function(intents, limit){
            let dataset = [];
            let data = [];
            for(let intent in intents){
                data.push({
                    intent: intent,
                    count: intents[intent]
                });
            }
            data.sort(function(a, b){//order by count desc
                return b.count - a.count;
            });
            data = data.splice(0, limit);
            data.forEach(function(intent){
                dataset.push({
                    key: intent.intent,
                    values: [{
                        x: 0,
                        y: intent.count
                    }]
                });
            });
            return dataset;
        };

    //get top intents
        let getTopIntents = function(filters){
            return new Promise(function(resolve, reject){
                loadData(filters).then(function(data){
                    let intents = getIntentsData(data, filters);
                    let dataset = getTopIntentsDataset(intents, filters.limit);
                    resolve(dataset);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //revealed module
        return {
            wordcloud: getWordcloud,
            topIntents: getTopIntents
        };
     };   
}());