(function () {
    "use strict";
    module.exports = function(db){

    //get data from db
        let loadData = function(){
            let query = {
                "selector": {
                    "_id": {
                        "$gt": null
                    }
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

    //get sessions with given intent
        let getSessionsData = function(data, targetIntent){
            let sessions = {};
            data.forEach(function(doc){//filter sessionIDs
                if(doc.hasOwnProperty("sessionID") && doc.hasOwnProperty("chatHistory")){
                    doc.chatHistory.forEach(function(message){
                        let matchedIntent = false;
                        message.intents.forEach(function(intent){//check if this chat has given targetIntent, if it does push all its intents
                            if(intent.intent === targetIntent && matchedIntent === false){
                                matchedIntent = true;
                            }
                        });
                        if(matchedIntent){    
                        //set session unique identifier property
                            if(!sessions.hasOwnProperty(doc.sessionID)){
                                sessions[doc.sessionID] = {};
                            } 
                        }
                    });
                }
            });
            data.forEach(function(doc){//get all intents for each sessionID
               if(doc.hasOwnProperty("sessionID") && doc.hasOwnProperty("chatHistory") && sessions.hasOwnProperty(doc.sessionID)){
                    doc.chatHistory.forEach(function(message){
                        message.intents.forEach(function(intent){//check if this chat has given targetIntent, if it does push all its intents
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
        let getWordcloudDataset = function(sessions){
            let list = [];
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
            for(let intent in intents){
                list.push([intent, intents[intent]]);
            }
            list.sort(function(a, b){//order by count desc
                return b[1] - a[1];
            });
            return list;
        };

    //revealed module
        return function(intent){
            return new Promise(function(resolve, reject){
                loadData().then(function(data){
                    let sessions = getSessionsData(data, intent);
                    let dataset = getWordcloudDataset(sessions);
                    resolve({
                        sessions: sessions,
                        dataset: dataset
                    });
                }).catch(function(error){
                    reject(error);
                });
            });
        };
     };   
}());