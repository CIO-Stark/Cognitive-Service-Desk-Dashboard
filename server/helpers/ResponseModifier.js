/**
 * Responsavel por modificacoes realizadas na resposta retornada do Conversation
 * para retorno ao cliente que consome o provider
 */
(function () {
    "use strict";
    
    var mu = require('mu2'); //TODO
    var fs = require("fs");
    var elements = require("./elements")();
    //var supportTemplate = fs.readFileSync(__dirname + '/../templates/supportMainMenu.html', 'utf8');
    //supportTemplate = supportTemplate.replace("\n", "");
    //supportTemplate = supportTemplate.replace("\t", "");
    //mu.root = __dirname + '/templates'
    module.exports = function (text) {
    		
    		/**
    		 * matching the mustache {{}} tags in watson with the elements
    		 */
    		for(var index in elements.list()){
    			if(text.indexOf('{{' + index + '}}') != -1)         	
                	text = text.replace('{{' + index + '}}', elements.get(index));
    		}
    		
    		// time of day greeting message TODO internacionalizar
            if(text.indexOf('{{hourGreeting}}') != -1){
            	var hour = new Date().getHours();
            	if(hour > 4 && hour <= 12)
            		text = text.replace('{{hourGreeting}}', 'bom dia');
            	else if (hour > 12 && hour < 19)
            		text = text.replace('{{hourGreeting}}', 'boa tarde');
            	else text = text.replace('{{hourGreeting}}', 'boa noite');
            }
            	
            /*
             TODO 
             mu.compileText("supportMainMenu", conversationResponse, function(data){
            	console.log(data.toString());
            	callback(data);
            });*/

           
    	
    	return text;
    		

    }
}());