/**
 * Created by danielabrao on 2/10/17.
 */
(function () {
    "use strict";
    
    var respModifier = require("../../helpers/ResponseModifier");

    module.exports = function (app, hrConversation) {

        var conversationCollection = {
            "hr_module": hrConversation
        };

        app.post("/askWatson", function (req, res) {
            console.log(req.body);
        	res.setHeader('Access-Control-Allow-Origin', '*');
            var context;
            if (!conversationCollection.hasOwnProperty(req.query.module)) {
                return res.status(404).send("Requested module is not available");
            }

            if (!req.query.question && !req.body.question) {
                return res.status(403).send("Can not proceed without question property");
            }

            if (req.body.context) {
                try {
                    context = JSON.parse(req.body.context);
                } catch (e) {
                    context = {}
                }
            }

            conversationCollection[req.query.module].sendMessage({
            	"input": {
                "text": req.body.question
                },
                "context": context
            }).then(function (data) {
            	console.info("Watson Conversation Return:\n %j", data);
            	// applying templates modification ( 
            	if (data.hasOwnProperty("output") && data.output.text.length)
                    data.output.text[0] = respModifier(data.output.text[0]);
            	console.info("Watson response: %s", data.output.text[0]);
            	
                return res.status(200).send(data);
            }, function (err) {
                console.log(err);
                return res.status(500).send(err);
            });
        });

        /**
         * this endpoint returns static responsed to be shown when user selects the option saying
         * feedback was not helpful (only when getExtraOptions is enabled)
         */
        app.post("/getExtraOptions", function (req, res) {
        	res.setHeader('Access-Control-Allow-Origin', '*');
            if (!conversationCollection.hasOwnProperty(req.query.module)) {
                return res.status(404).send("Requested module is not available");
            }

            if (!req.query.query && !req.body.query) {
                return res.status(403).send("Can not proceed without question property");
            }

            /**
             * the responses here must be dynamic and linked to the context of your conversation flow
             */
            return res.status(200).send([{
                "canonical": "As respostas não me ajudaram",
                "answer": "As respostas não me ajudaram",
                "source": "conversation"
            }, {
                "canonical": "Não resolveu meu problema",
                "answer": "Não resolveu meu problema",
                "source": "conversation"
            }, {
                "canonical": "Resposta estava incorreta",
                "answer": "Resposta estava errada",
                "source": "conversation"
            }, {
                "canonical": "Nenhuma das anteriores",
                "answer": "Nenhuma das anteriores",
                "source": "conversation"
            }
            
            ]);
        });

    }

}());