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
                    "type" : 'feedback',
                },
                "fields": ["chatHistory", "feedbackStatus", "feedbackDate", "userID"]
                    
                
            };
            return new Promise(function(resolve, reject){
                db.get(query).then(function(response){
                    resolve(response.docs);
                }).catch(function(error){
                    reject(error);
                });
            });
        };


    
        let getGeneric = function(data){
            let countQuestion = 0;
            let sumConfidence = 0;
            let countConfidence = 0;
            let countSessions = 0;
            let sessions = {};
            data.forEach(doc => {
                if(!sessions[doc.sessionID]){
                    sessions[doc.sessionID] = 1;
                    countSessions++;
                }
                if(doc.hasOwnProperty("chatHistory"))
                    doc.chatHistory.forEach(chat => {
                        if(!chat.hasOwnProperty("userId"))
                            countQuestion++;
                        else{
                            if(chat.intents.length){
                                sumConfidence += chat.intents[0].confidence;
                                countConfidence++;
                            }
                        }

                    });
            })
            
            return [countQuestion, sumConfidence/countConfidence, countSessions, data.length];
        };

    //get top intents
        let getAllInsights = function(filters){
            return new Promise(function(resolve, reject){
                loadData(filters).then(function(data){
                    let getAll = getGeneric(data);
                    let ret = {
                        totalQuestions : getAll[0],
                        generalConfidence: getAll[1],
                        totalSessions: getAll[2],
                        totalFeedbacks: getAll[3]
                    };
                    resolve(ret);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //revealed module
        return {
            allInsights: getAllInsights
        };
     };   
}());