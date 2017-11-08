(function () {
    "use strict";

    module.exports = function () {
    	var elementList = {
                "supportMainMenu": "<ul><li onclick=\"document.getElementById('widget-input').value='suporte fisico';\">Suporte físico para máquinas</li><li>Gerenciamento de senhas</li><li>Gerenciamento de usuários</li></ul>",
                "equipmentList": "<ul><li>TP</li><li>Mac</li><li>Não sei</li></ul>",
                "supportMacFinal": "Ok, para problemas com Mac acesse a documentação:<br /> <a target=_blank href=https://manuals.info.apple.com/MANUALS/1000/MA1766/en_US/macbook_pro_late2016_essentials.pdf>Documentação Apple</a>",
                "supportUser": "Os problemas de usuário que posso te ajudar agora são:<br /> <ul><li onclick=\"document.getElementById('widget-input').value='Criacão de usuário';\">Criação de usuário</li><li>Senha não funciona</li><li>Usuário travado</li><li>Não lembro meu user ID</li></ul>"
            };

        return {
        	"list": function(){ return elementList
        	},
            "get": function (el) {
                if (elementList[el]) {
                    return elementList[el];
                } else {
                    throw new Error("Invalid Element required");
                }
            },
            "set": function (el, val) {
                elementList[el] = val;
            }
        };
    };

}());
