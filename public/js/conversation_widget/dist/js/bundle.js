(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by danielabrao on 1/17/17.
 */
(function () {
    "use strict";

    module.exports = function (elements, factory, appPhrases, document) {


        var dynamicInput = require("./dynamicInput.script");

        var props = {
            "enableFeedback": false
        };

        var methods = {
            "sendQuestion": function (text) {
                methods.showLoad();
                factory.makeQuestion(text).then(function successCB(answer) {
                    if (answer.hasOwnProperty("output") && answer.output.text.length) {
                        builder.buildChatBubble(answer.output.text[0], "watson");
                        if (props.enableFeedback) {
                            methods.toggleFeedbackOptions();
                        }
                    } else {
                        builder.buildChatBubble(appPhrases.watsonNegative, "watson");
                    }
                }, function errorCB(error) {
                    console.log(error);
                }).then(function () {
                    methods.hideLoad();
                });

                return this;
            },
            "toggleFeedbackOptions": function () {
                console.log(elements.get("feedbackEl"));
                elements.get("feedbackEl").classList.toggle("show-feedback");
            },
            "sendFeedback": function (option, payload) {
                factory.sendFeedback(option, payload).then(function successCB(data) {
                    console.log(data);
                    builder.buildChatBubble(appPhrases.watsonFeedback, "watson");
                }, function errorCB(error) {
                    console.log(error);
                }).then(function () {
                    methods.toggleFeedbackOptions();
                });

                return this;
            },
            "scrollChatToBottom": function () {
                elements.get("chatWrapper").scrollTop = elements.get("chatWrapper").scrollHeight;
                return this;
            },
            "showLoad": function () {
                elements.get("loadingEl").classList.add("show-loading");
            },
            "hideLoad": function () {
                elements.get("loadingEl").classList.remove("show-loading");
            },
            "cleanInput": function () {
                elements.get("inputEl").value = "";
                return this;
            },
            "inputFocus": function () {
                elements.get("inputEl").focus();
                return this;
            }
        };

        var builder = {
            "attachClickListener": function (el, cb) {
                try {
                    el.addEventListener("click", cb);
                } catch (error) {
                    console.warn(error);
                    throw new Error("Invalid HTML Element");
                }
            },
            "attachKeyListener": function (el, cb, secondCB) {
                try {
                    el.addEventListener("keyup", function (e) {
                        var key = e.which || e.keyCode;
                        if (key === 13) {
                            cb();
                        }
                        secondCB();

                    });
                } catch (error) {
                    console.warn(error);
                }
            },
            "createWidgetHeader": function (widgetConfigs) {
                var header = document.createElement("header"),
                    logoImg = document.createElement("img"),
                    headerTitle = document.createElement("h2");


                logoImg.setAttribute("alt", "Custom logo");
                logoImg.src = elements.get("headerLogo");
                logoImg.onerror = function () {
                    logoImg.src = "http://placehold.it/48x48";
                };
                headerTitle.appendChild(document.createTextNode(widgetConfigs.customTitle || "Watson Conversation"));

                header.appendChild(logoImg);
                header.appendChild(headerTitle);
                header.classList.add("widget-header");

                return header;
            },
            "createWidgetBody": function () {
                var chatWrapper = document.createElement("div"),
                    chatEl = document.createElement("div"),
                    loadingEl = document.createElement("div");


                chatWrapper.classList.add("widget-body");
                chatEl.classList.add("widget-chat");
                loadingEl.setAttribute("id", "loading");

                elements.set("chatWrapper", chatWrapper);
                elements.set("chatEl", chatEl);
                elements.set("loadingEl", loadingEl);

                chatEl.appendChild(loadingEl);
                if (props.enableFeedback) {
                    var feedbackDiv = document.createElement("div"),
                        feedbackDisclaimer = document.createElement("label"),
                        buttonBox = document.createElement("div"),
                        positiveBtn = document.createElement("button"),
                        negativeBtn = document.createElement("button");

                    builder.attachClickListener(positiveBtn, function () {
                        methods.sendFeedback("positive", {
                            "id": "x"
                        });
                    });

                    builder.attachClickListener(negativeBtn, function () {
                        methods.sendFeedback("negative", {
                            "id": "x"
                        });
                    });


                    feedbackDiv.classList.add("feedback-session");

                    feedbackDisclaimer.appendChild(document.createTextNode(appPhrases.feedbackDisclaimer));
                    positiveBtn.appendChild(document.createTextNode(appPhrases.feedbackYesBtn));
                    negativeBtn.appendChild(document.createTextNode(appPhrases.feedbackNoBtn));

                    feedbackDiv.appendChild(feedbackDisclaimer);
                    buttonBox.appendChild(positiveBtn);
                    buttonBox.appendChild(negativeBtn);
                    feedbackDiv.appendChild(buttonBox);

                    elements.set("feedbackEl", feedbackDiv);

                    chatEl.appendChild(feedbackDiv);
                }

                chatWrapper.appendChild(chatEl);
                return chatWrapper;
            },
            "buildChatBubble": function (textInput, sender) {
                var self = this;
                if (!textInput) {
                    return;
                }

                var msgWrapper = document.createElement("div"),
                    msgBubble = document.createElement("span");

                msgWrapper.classList.add("msg-wrapper");
                msgBubble.classList.add("chat-bubble");
                msgBubble.innerHTML = textInput;

                if (sender === "watson") {
                    msgWrapper.classList.add("left");
                } else {
                    msgWrapper.classList.add("right");
                }

                msgWrapper.appendChild(msgBubble);
                elements.get("chatEl").appendChild(msgWrapper);
                methods.scrollChatToBottom();
                return self;
            },
            "createWidgetFooter": function () {
                var self = this,
                    footer = document.createElement("div"),
                    inputWrapper = document.createElement("p"),
                    inputLabel = document.createElement("label"),
                    textInput = document.createElement("input"),
                    sendButton = document.createElement("button");

                elements.set("inputEl", textInput);

                var buttonListener = function () {
                    if (textInput.value) {
                        builder.buildChatBubble(textInput.value);
                        methods.sendQuestion(textInput.value).cleanInput().inputFocus();
                    }
                };

                dynamicInput({
                    "handler": textInput,//needed
                    "minWidth": 25,//handler minimum width, default: 10
                    "parent": inputWrapper
                });

                var updateInputStyle = function () {
                    if (textInput.value) {
                        textInput.style.borderBottom = "2px solid black";
                    } else {
                        textInput.style.borderBottom = "0";
                    }
                };

                footer.classList.add("widget-footer");
                inputWrapper.classList.add("input-wrapper");

                inputLabel.setAttribute("for", "widget-input");
                textInput.setAttribute("type", "text");
                textInput.setAttribute("id", "widget-input");

                self.attachClickListener(inputWrapper, methods.inputFocus);
                self.attachClickListener(sendButton, buttonListener);
                self.attachKeyListener(textInput, buttonListener, updateInputStyle);

                inputWrapper.appendChild(inputLabel);
                inputWrapper.appendChild(textInput);

                footer.appendChild(inputWrapper);
                footer.appendChild(sendButton);

                return footer;
            }
        };
        return {
            "createWidget": function (widgetConfigs) {
                var widgetEl = document.createElement("div");
                props.enableFeedback = widgetConfigs.enableFeedback;

                widgetEl.classList.add("conversation-widget");

                if (widgetConfigs.includeHeader) {
                    if (widgetConfigs.customLogo) {
                        elements.set("headerLogo", widgetConfigs.customLogo);
                    }
                    widgetEl.appendChild(builder.createWidgetHeader(widgetConfigs));
                }

                widgetEl.appendChild(builder.createWidgetBody());
                widgetEl.appendChild(builder.createWidgetFooter());
                return widgetEl;
            }
        };
    };
}());
},{"./dynamicInput.script":3}],2:[function(require,module,exports){
/**
 * Created by danielabrao on 1/16/17.
 */
(function () {
    "use strict";

    module.exports = function (window, factory, appPhrases) {


        var self = {
            "methods": {
                "appendToBox": function (parentContainer, widget) {
                    try {
                        window.document.querySelector(parentContainer).appendChild(widget);
                    } catch (e) {
                        throw new Error("Invalid parent container");
                    }
                }
            }
        };

        return {
            "createWidgetInstance": function (widgetConfigs) {
                var elements = require("../elements/elements.script")(),
                    builder = require("./chatBuilder.script")(elements, factory, appPhrases, window.document),
                    widget = builder.createWidget(widgetConfigs),
                    bodyEl;

                if (widgetConfigs.parentContainer) {
                    self.methods.appendToBox(widgetConfigs.parentContainer, widget);
                } else {
                    bodyEl = window.document.querySelector("body");
                }

            }
        };
    };


}());
},{"../elements/elements.script":4,"./chatBuilder.script":1}],3:[function(require,module,exports){
/**
 * Created by danielabrao on 1/23/17.
 */
/*
 * @version: 0.1
 * @author: Guilherme Henrique Oka Marques
 */
(function(){


    "use strict";
    var createDummy = function(element, classes, parent){
        var target = parent,
            dummy = document.createElement("pre");
        dummy.className = classes;
        dummy.style.position = "absolute";
        dummy.style.top = "0px";
        dummy.style.left = "0px";
        dummy.style.height = "0px";
        dummy.style.maxWidth = "100%";
        dummy.style.zIndex = "-1";
        dummy.style.opacity = "0";
        dummy.style.visibility = "hidden";
        dummy.style.overflow = "hidden";
        dummy.style.display = "inline-block";
        target.appendChild(dummy);
        return dummy;
    };
    var updateSize = function(element, dummy, minWidth){
        dummy.textContent = element.value;
        element.style.width = Math.max(minWidth, dummy.offsetWidth) + "px";
    };
    var resetSize = function(element, dummy, minWidth){
        element.value = "";
        element.style.width = minWidth + "px";
        dummy.textContent = "";
    };
    var apply = function(config){

        var dummy = createDummy(config.handler, config.classes, config.parent);
        config.handler.oninput = function(e){
            updateSize(this, dummy, config.minWidth);
        };
        resetSize(config.handler, dummy, config.minWidth);
    };
    module.exports = function(setup){
        apply({
            handler: setup.handler,
            minWidth: setup.minWidth || 10,
            classes: (setup.classes || "") + " dynamicInputDummy",
            parent: setup.parent || document.querySelector("body")
        });
    };
})();
},{}],4:[function(require,module,exports){
/**
 * Created by danielabrao on 1/17/17.
 */
(function () {
    "use strict";

    module.exports = function () {
        var elementList = {
            "htmlBody": "",
            "widgetEl": "",
            "chatHeader": "",
            "chatWrapper": "",
            "chatEl": "",
            "feedbackEl": "",
            "chatFooter": "",
            "loadingEl": "",
            "inputEl": "",
            "headerLogo": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNTAgNTAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBpZD0iV2F0c29uX0F2YXRhcl9GbGF0XzRfIiBmaWxsPSIjNUFBQUZBIiBkPSJNOC40LDIwLjhjLTAuMSwwLTAuMywwLTAuNC0wLjFsLTQuMi0yLjRDMy4zLDE4LDMuMiwxNy40LDMuNCwxNwoJYzAuMi0wLjQsMC44LTAuNiwxLjItMC4zbDQuMiwyLjRjMC40LDAuMiwwLjYsMC44LDAuMywxLjJDOSwyMC42LDguNywyMC44LDguNCwyMC44eiBNMTYsMTMuNWMwLjQtMC4yLDAuNi0wLjgsMC4zLTEuMmwtMi40LTQuMgoJYy0wLjItMC40LTAuOC0wLjYtMS4yLTAuM2MtMC40LDAuMi0wLjYsMC44LTAuMywxLjJsMi40LDQuMmMwLjIsMC4zLDAuNSwwLjQsMC44LDAuNEMxNS43LDEzLjYsMTUuOSwxMy41LDE2LDEzLjV6IE0yNi4yLDEwLjFWNS4yCgljMC0wLjUtMC40LTAuOS0wLjktMC45Yy0wLjUsMC0wLjksMC40LTAuOSwwLjl2NC44YzAsMC41LDAuNCwwLjksMC45LDAuOUMyNS44LDExLDI2LjIsMTAuNiwyNi4yLDEwLjF6IE0zNS45LDEzLjFsMi40LTQuMgoJYzAuMi0wLjQsMC4xLTEtMC4zLTEuMmMtMC40LTAuMi0xLTAuMS0xLjIsMC4zbC0yLjQsNC4yYy0wLjIsMC40LTAuMSwxLDAuMywxLjJjMC4xLDAuMSwwLjMsMC4xLDAuNCwwLjEKCUMzNS41LDEzLjYsMzUuOCwxMy40LDM1LjksMTMuMXogTTQyLjgsMjAuNmw0LjItMi40YzAuNC0wLjIsMC42LTAuOCwwLjMtMS4yYy0wLjItMC40LTAuOC0wLjYtMS4yLTAuM2wtNC4yLDIuNAoJYy0wLjQsMC4yLTAuNiwwLjgtMC4zLDEuMmMwLjIsMC4zLDAuNSwwLjQsMC44LDAuNEM0Mi41LDIwLjgsNDIuNywyMC43LDQyLjgsMjAuNnogTTI2LjEsMTQuM2MtMS42LDAtMy40LDAuNC00LjUsMC43CgljLTAuMSwwLTAuMiwwLjEtMC4yLDAuMmMwLDAuMSwwLjEsMC4yLDAuMiwwLjJjMC4xLDAsMC4zLTAuMSwwLjUtMC4xYzAuOS0wLjEsMS40LTAuMiwyLjctMC4yYzEuNSwwLDIuOSwwLjMsNC40LDAuOAoJQzIzLjQsMTgsMTcuNywyNS45LDE1LjgsMzNjLTIuMS0yLjMtMy40LTQuOS0zLjQtNy40YzAtNC4xLDMuNC02LjYsOC4zLTYuNmMwLjIsMCwwLjMsMCwwLjQsMGMwLjEsMCwwLjEtMC4xLDAuMS0wLjIKCWMwLTAuMS0wLjEtMC4xLTAuMi0wLjJjLTAuMy0wLjEtMS4xLTAuMS0xLjktMC4xYy00LjksMC04LjUsMi41LTguNSw3LjFjMCwzLjEsMS44LDYuNSw0LjcsOS40Yy0wLjIsMS0wLjMsMi0wLjMsMi45CgljMCwwLjQsMCwxLjEsMC4yLDEuOWMtMS43LTEuNS0zLTMuMy0zLjctNS4yYy0wLjEtMC40LTAuNC0xLjEtMC41LTEuM2MwLTAuMS0wLjEtMC4yLTAuMi0wLjJjLTAuMSwwLTAuMiwwLjEtMC4yLDAuMgoJYzAsMC4xLDAsMC40LDAuMSwwLjVjMSw1LjIsNi4yLDExLjgsMTQuNiwxMS44YzkuNCwwLDE1LjgtNy43LDE1LjgtMTUuOEM0MS4yLDIxLjQsMzQuOCwxNC4zLDI2LjEsMTQuM3ogTTI1LjMsNDMuNwoJYy0zLDAtNS42LTEuMS02LjctMS43Yy0xLjUtMC44LTEuOS0yLjItMS45LTQuMWMwLTAuNSwwLTEuMSwwLjEtMS42YzMuNywzLjEsOC43LDUuMywxMy42LDUuM2MxLjEsMCwyLjEtMC4yLDMtMC40bDAsMAoJQzMxLjksNDIuNCwyOC45LDQzLjcsMjUuMyw0My43eiBNMzAuNCwzOS45Yy00LjcsMC05LjctMi4zLTEzLjItNS41YzEuOC04LjIsOS4yLTE3LjMsMTMuOS0xNy4zYzAuNSwwLDEsMC4xLDEuNiwwLjUKCWMwLjksMC42LDEuOCwxLjMsMi41LDJjMi4yLDIuMSw0LjIsNS43LDQuMiwxMC4xYzAsMy40LTEuMiw2LjEtMi40LDcuN0MzNS42LDM5LjIsMzMuMSwzOS45LDMwLjQsMzkuOXoiLz4KPC9zdmc+",
            "watsonPic": ""
        };
        return {
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
},{}],5:[function(require,module,exports){
/**
 * Created by danielabrao on 1/16/17.
 */
(function () {
    "use strict";

    module.exports = function (window) {

        var conversationContext = {};
        var urls = {
            "feedback": "",
            "conversation": ""
        };

        return {
            "setUrl": function (url, type) {
                urls[type] = url;
            },
            "getUrl": function (type) {
                return urls[type];
            },
            "makeQuestion": function (question) {
                return new Promise(function (resolve, reject) {
                    if (window.XMLHttpRequest) {
                        var xhttp = new window.XMLHttpRequest();
                        xhttp.onreadystatechange = function() {
                            if (xhttp.readyState === 4) {
                                if (xhttp.status === 200) {
                                    var response = JSON.parse(xhttp.responseText);
                                    if (response.context) {
                                        conversationContext = response.context;
                                    }
                                    resolve(response);
                                } else {
                                    reject(xhttp.responseText);
                                }
                            }
                        };

                        xhttp.open("POST", urls.conversation, true);
                        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
                        xhttp.send(["question=", question, "&context=", JSON.stringify(conversationContext)].join(""));
                    } else {
                        reject("AJAX Calls not supported on this browser");
                    }
                });
            },
            "sendFeedback": function (option, feedbackObj) {
                return new Promise(function (resolve, reject) {
                    if (window.XMLHttpRequest) {
                        var xhttp = new window.XMLHttpRequest();
                        xhttp.onreadystatechange = function() {
                            if (xhttp.readyState === 4) {
                                if (xhttp.status === 200) {
                                    resolve(JSON.parse(xhttp.responseText));
                                } else {
                                    reject(xhttp.responseText);
                                }
                            }
                        };

                        xhttp.open("POST", urls.feedback, true);
                        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
                        xhttp.send(["option=", option, "&feedback=", JSON.stringify(feedbackObj), "&context=", conversationContext].join(""));
                        console.log(["option=", option, "&feedback=", JSON.stringify(feedbackObj), "&context=", conversationContext].join(""));

                    } else {
                        reject("AJAX Calls not supported on this browser");
                    }

                });
            }
        };
    };


}());
},{}],6:[function(require,module,exports){
/**
 * Created by danielabrao on 1/16/17.
 */
(function () {
    "use strict";

    var global,
        appPhrases,
        appLanguage,
        factory,
        controller;

    try {
        global = window || "";
    } catch (e) {
        console.log("Node JS environment");
    }

    function conversationWidget (windowObj) {
        var window = global || windowObj;

        if (!window) {
            throw new Error("Window object is not present");
        } else {
            appLanguage = (window.navigator.languages && window.navigator.languages[0]) || // Chrome / Firefox
                window.navigator.language ||   // All browsers
                window.navigator.userLanguage;

            appPhrases = require("./model/internationalization.script")(appLanguage);
            factory = require("./factory/factory.script")(window);
            controller = require("./controller/controller.script")(window, factory, appPhrases);

            return {
                "init": function (configs) {

                    if (!configs.baseURL) {
                        throw new Error("Can not proceed without a valid URL");
                    }

                    if (configs.enableFeedback) {
                        if (!configs.feedbackEndpoint) {
                            throw new Error("You must provide a feedback endpoint whenever enableFeedback is true");
                        } else {
                            factory.setUrl(configs.feedbackEndpoint, "feedback");
                        }
                    }

                    factory.setUrl(configs.baseURL, "conversation");
                    controller.createWidgetInstance(configs);
                    return true;

                }
            };
        }
    }

    if (global) {
        global.conversationWidget = conversationWidget(global);
    } else {
        module.exports = conversationWidget;
    }

}());
},{"./controller/controller.script":2,"./factory/factory.script":5,"./model/internationalization.script":7}],7:[function(require,module,exports){
/**
 * Created by danielabrao on 1/18/17.
 */
(function () {
    "use strict";

    var languages = {
        "pt": {
            "watsonNegative": "Infelizmente não entendi. Tente perguntar com outras palavras",
            "feedbackDisclaimer": "Isso ajudou?",
            "feedbackYesBtn": "Sim",
            "feedbackNoBtn": "Não"
        },
        "en": {
            "watsonNegative": "I did not understood. Try with another words",
            "feedbackDisclaimer": "Did it help?",
            "feedbackYesBtn": "Yes",
            "feedbackNoBtn": "No"
        },
        "es": {
            "watsonNegative": "",
            "feedbackDisclaimer": "",
            "feedbackYesBtn": "",
            "feedbackNoBtn": ""
        }

    };

    module.exports = function (countryCode) {
        return languages[countryCode] || languages.en;
    };


}());
},{}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5pZWxhYnJhby9EZXNrdG9wL2libS93aXRfd2lkZ2V0L2pzL2NvbnZlcnNhdGlvbl93aWRnZXQvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW5pZWxhYnJhby9EZXNrdG9wL2libS93aXRfd2lkZ2V0L2pzL2NvbnZlcnNhdGlvbl93aWRnZXQvanMvY29udHJvbGxlci9jaGF0QnVpbGRlci5zY3JpcHQuanMiLCIvVXNlcnMvZGFuaWVsYWJyYW8vRGVza3RvcC9pYm0vd2l0X3dpZGdldC9qcy9jb252ZXJzYXRpb25fd2lkZ2V0L2pzL2NvbnRyb2xsZXIvY29udHJvbGxlci5zY3JpcHQuanMiLCIvVXNlcnMvZGFuaWVsYWJyYW8vRGVza3RvcC9pYm0vd2l0X3dpZGdldC9qcy9jb252ZXJzYXRpb25fd2lkZ2V0L2pzL2NvbnRyb2xsZXIvZHluYW1pY0lucHV0LnNjcmlwdC5qcyIsIi9Vc2Vycy9kYW5pZWxhYnJhby9EZXNrdG9wL2libS93aXRfd2lkZ2V0L2pzL2NvbnZlcnNhdGlvbl93aWRnZXQvanMvZWxlbWVudHMvZWxlbWVudHMuc2NyaXB0LmpzIiwiL1VzZXJzL2RhbmllbGFicmFvL0Rlc2t0b3AvaWJtL3dpdF93aWRnZXQvanMvY29udmVyc2F0aW9uX3dpZGdldC9qcy9mYWN0b3J5L2ZhY3Rvcnkuc2NyaXB0LmpzIiwiL1VzZXJzL2RhbmllbGFicmFvL0Rlc2t0b3AvaWJtL3dpdF93aWRnZXQvanMvY29udmVyc2F0aW9uX3dpZGdldC9qcy9tYWluLnNjcmlwdC5qcyIsIi9Vc2Vycy9kYW5pZWxhYnJhby9EZXNrdG9wL2libS93aXRfd2lkZ2V0L2pzL2NvbnZlcnNhdGlvbl93aWRnZXQvanMvbW9kZWwvaW50ZXJuYXRpb25hbGl6YXRpb24uc2NyaXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgZGFuaWVsYWJyYW8gb24gMS8xNy8xNy5cbiAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsZW1lbnRzLCBmYWN0b3J5LCBhcHBQaHJhc2VzLCBkb2N1bWVudCkge1xuXG5cbiAgICAgICAgdmFyIGR5bmFtaWNJbnB1dCA9IHJlcXVpcmUoXCIuL2R5bmFtaWNJbnB1dC5zY3JpcHRcIik7XG5cbiAgICAgICAgdmFyIHByb3BzID0ge1xuICAgICAgICAgICAgXCJlbmFibGVGZWVkYmFja1wiOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBtZXRob2RzID0ge1xuICAgICAgICAgICAgXCJzZW5kUXVlc3Rpb25cIjogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgICAgICAgICBtZXRob2RzLnNob3dMb2FkKCk7XG4gICAgICAgICAgICAgICAgZmFjdG9yeS5tYWtlUXVlc3Rpb24odGV4dCkudGhlbihmdW5jdGlvbiBzdWNjZXNzQ0IoYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbnN3ZXIuaGFzT3duUHJvcGVydHkoXCJvdXRwdXRcIikgJiYgYW5zd2VyLm91dHB1dC50ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlci5idWlsZENoYXRCdWJibGUoYW5zd2VyLm91dHB1dC50ZXh0WzBdLCBcIndhdHNvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wcy5lbmFibGVGZWVkYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMudG9nZ2xlRmVlZGJhY2tPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZGVyLmJ1aWxkQ2hhdEJ1YmJsZShhcHBQaHJhc2VzLndhdHNvbk5lZ2F0aXZlLCBcIndhdHNvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIGVycm9yQ0IoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLmhpZGVMb2FkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRvZ2dsZUZlZWRiYWNrT3B0aW9uc1wiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZWxlbWVudHMuZ2V0KFwiZmVlZGJhY2tFbFwiKSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwiZmVlZGJhY2tFbFwiKS5jbGFzc0xpc3QudG9nZ2xlKFwic2hvdy1mZWVkYmFja1wiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNlbmRGZWVkYmFja1wiOiBmdW5jdGlvbiAob3B0aW9uLCBwYXlsb2FkKSB7XG4gICAgICAgICAgICAgICAgZmFjdG9yeS5zZW5kRmVlZGJhY2sob3B0aW9uLCBwYXlsb2FkKS50aGVuKGZ1bmN0aW9uIHN1Y2Nlc3NDQihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBidWlsZGVyLmJ1aWxkQ2hhdEJ1YmJsZShhcHBQaHJhc2VzLndhdHNvbkZlZWRiYWNrLCBcIndhdHNvblwiKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiBlcnJvckNCKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy50b2dnbGVGZWVkYmFja09wdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2Nyb2xsQ2hhdFRvQm90dG9tXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJjaGF0V3JhcHBlclwiKS5zY3JvbGxUb3AgPSBlbGVtZW50cy5nZXQoXCJjaGF0V3JhcHBlclwiKS5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzaG93TG9hZFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwibG9hZGluZ0VsXCIpLmNsYXNzTGlzdC5hZGQoXCJzaG93LWxvYWRpbmdcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJoaWRlTG9hZFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwibG9hZGluZ0VsXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJzaG93LWxvYWRpbmdcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJjbGVhbklucHV0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJpbnB1dEVsXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImlucHV0Rm9jdXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLmdldChcImlucHV0RWxcIikuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYnVpbGRlciA9IHtcbiAgICAgICAgICAgIFwiYXR0YWNoQ2xpY2tMaXN0ZW5lclwiOiBmdW5jdGlvbiAoZWwsIGNiKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNiKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEhUTUwgRWxlbWVudFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJhdHRhY2hLZXlMaXN0ZW5lclwiOiBmdW5jdGlvbiAoZWwsIGNiLCBzZWNvbmRDQikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kQ0IoKTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImNyZWF0ZVdpZGdldEhlYWRlclwiOiBmdW5jdGlvbiAod2lkZ2V0Q29uZmlncykge1xuICAgICAgICAgICAgICAgIHZhciBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaGVhZGVyXCIpLFxuICAgICAgICAgICAgICAgICAgICBsb2dvSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKSxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG5cblxuICAgICAgICAgICAgICAgIGxvZ29JbWcuc2V0QXR0cmlidXRlKFwiYWx0XCIsIFwiQ3VzdG9tIGxvZ29cIik7XG4gICAgICAgICAgICAgICAgbG9nb0ltZy5zcmMgPSBlbGVtZW50cy5nZXQoXCJoZWFkZXJMb2dvXCIpO1xuICAgICAgICAgICAgICAgIGxvZ29JbWcub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nb0ltZy5zcmMgPSBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvNDh4NDhcIjtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGhlYWRlclRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHdpZGdldENvbmZpZ3MuY3VzdG9tVGl0bGUgfHwgXCJXYXRzb24gQ29udmVyc2F0aW9uXCIpKTtcblxuICAgICAgICAgICAgICAgIGhlYWRlci5hcHBlbmRDaGlsZChsb2dvSW1nKTtcbiAgICAgICAgICAgICAgICBoZWFkZXIuYXBwZW5kQ2hpbGQoaGVhZGVyVGl0bGUpO1xuICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKFwid2lkZ2V0LWhlYWRlclwiKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJjcmVhdGVXaWRnZXRCb2R5XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hhdFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICBjaGF0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICBsb2FkaW5nRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG5cbiAgICAgICAgICAgICAgICBjaGF0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwid2lkZ2V0LWJvZHlcIik7XG4gICAgICAgICAgICAgICAgY2hhdEVsLmNsYXNzTGlzdC5hZGQoXCJ3aWRnZXQtY2hhdFwiKTtcbiAgICAgICAgICAgICAgICBsb2FkaW5nRWwuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJsb2FkaW5nXCIpO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudHMuc2V0KFwiY2hhdFdyYXBwZXJcIiwgY2hhdFdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNldChcImNoYXRFbFwiLCBjaGF0RWwpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNldChcImxvYWRpbmdFbFwiLCBsb2FkaW5nRWwpO1xuXG4gICAgICAgICAgICAgICAgY2hhdEVsLmFwcGVuZENoaWxkKGxvYWRpbmdFbCk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmVuYWJsZUZlZWRiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmZWVkYmFja0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBmZWVkYmFja0Rpc2NsYWltZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25Cb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpdmVCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmVnYXRpdmVCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIuYXR0YWNoQ2xpY2tMaXN0ZW5lcihwb3NpdGl2ZUJ0biwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5zZW5kRmVlZGJhY2soXCJwb3NpdGl2ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIuYXR0YWNoQ2xpY2tMaXN0ZW5lcihuZWdhdGl2ZUJ0biwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5zZW5kRmVlZGJhY2soXCJuZWdhdGl2ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXYuY2xhc3NMaXN0LmFkZChcImZlZWRiYWNrLXNlc3Npb25cIik7XG5cbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXNjbGFpbWVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcFBocmFzZXMuZmVlZGJhY2tEaXNjbGFpbWVyKSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aXZlQnRuLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcFBocmFzZXMuZmVlZGJhY2tZZXNCdG4pKTtcbiAgICAgICAgICAgICAgICAgICAgbmVnYXRpdmVCdG4uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwUGhyYXNlcy5mZWVkYmFja05vQnRuKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXYuYXBwZW5kQ2hpbGQoZmVlZGJhY2tEaXNjbGFpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uQm94LmFwcGVuZENoaWxkKHBvc2l0aXZlQnRuKTtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uQm94LmFwcGVuZENoaWxkKG5lZ2F0aXZlQnRuKTtcbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXYuYXBwZW5kQ2hpbGQoYnV0dG9uQm94KTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5zZXQoXCJmZWVkYmFja0VsXCIsIGZlZWRiYWNrRGl2KTtcblxuICAgICAgICAgICAgICAgICAgICBjaGF0RWwuYXBwZW5kQ2hpbGQoZmVlZGJhY2tEaXYpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNoYXRXcmFwcGVyLmFwcGVuZENoaWxkKGNoYXRFbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYXRXcmFwcGVyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiYnVpbGRDaGF0QnViYmxlXCI6IGZ1bmN0aW9uICh0ZXh0SW5wdXQsIHNlbmRlcikge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICBpZiAoIXRleHRJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG1zZ1dyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICBtc2dCdWJibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblxuICAgICAgICAgICAgICAgIG1zZ1dyYXBwZXIuY2xhc3NMaXN0LmFkZChcIm1zZy13cmFwcGVyXCIpO1xuICAgICAgICAgICAgICAgIG1zZ0J1YmJsZS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1idWJibGVcIik7XG4gICAgICAgICAgICAgICAgbXNnQnViYmxlLmlubmVySFRNTCA9IHRleHRJbnB1dDtcblxuICAgICAgICAgICAgICAgIGlmIChzZW5kZXIgPT09IFwid2F0c29uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnV3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibGVmdFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtc2dXcmFwcGVyLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtc2dXcmFwcGVyLmFwcGVuZENoaWxkKG1zZ0J1YmJsZSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwiY2hhdEVsXCIpLmFwcGVuZENoaWxkKG1zZ1dyYXBwZXIpO1xuICAgICAgICAgICAgICAgIG1ldGhvZHMuc2Nyb2xsQ2hhdFRvQm90dG9tKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJjcmVhdGVXaWRnZXRGb290ZXJcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIiksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiksXG4gICAgICAgICAgICAgICAgICAgIHRleHRJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKSxcbiAgICAgICAgICAgICAgICAgICAgc2VuZEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50cy5zZXQoXCJpbnB1dEVsXCIsIHRleHRJbnB1dCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgYnV0dG9uTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIuYnVpbGRDaGF0QnViYmxlKHRleHRJbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnNlbmRRdWVzdGlvbih0ZXh0SW5wdXQudmFsdWUpLmNsZWFuSW5wdXQoKS5pbnB1dEZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZHluYW1pY0lucHV0KHtcbiAgICAgICAgICAgICAgICAgICAgXCJoYW5kbGVyXCI6IHRleHRJbnB1dCwvL25lZWRlZFxuICAgICAgICAgICAgICAgICAgICBcIm1pbldpZHRoXCI6IDI1LC8vaGFuZGxlciBtaW5pbXVtIHdpZHRoLCBkZWZhdWx0OiAxMFxuICAgICAgICAgICAgICAgICAgICBcInBhcmVudFwiOiBpbnB1dFdyYXBwZXJcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciB1cGRhdGVJbnB1dFN0eWxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dElucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0SW5wdXQuc3R5bGUuYm9yZGVyQm90dG9tID0gXCIycHggc29saWQgYmxhY2tcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJbnB1dC5zdHlsZS5ib3JkZXJCb3R0b20gPSBcIjBcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmb290ZXIuY2xhc3NMaXN0LmFkZChcIndpZGdldC1mb290ZXJcIik7XG4gICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoXCJpbnB1dC13cmFwcGVyXCIpO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRMYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgXCJ3aWRnZXQtaW5wdXRcIik7XG4gICAgICAgICAgICAgICAgdGV4dElucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0XCIpO1xuICAgICAgICAgICAgICAgIHRleHRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcIndpZGdldC1pbnB1dFwiKTtcblxuICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoQ2xpY2tMaXN0ZW5lcihpbnB1dFdyYXBwZXIsIG1ldGhvZHMuaW5wdXRGb2N1cyk7XG4gICAgICAgICAgICAgICAgc2VsZi5hdHRhY2hDbGlja0xpc3RlbmVyKHNlbmRCdXR0b24sIGJ1dHRvbkxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICBzZWxmLmF0dGFjaEtleUxpc3RlbmVyKHRleHRJbnB1dCwgYnV0dG9uTGlzdGVuZXIsIHVwZGF0ZUlucHV0U3R5bGUpO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyLmFwcGVuZENoaWxkKGlucHV0TGFiZWwpO1xuICAgICAgICAgICAgICAgIGlucHV0V3JhcHBlci5hcHBlbmRDaGlsZCh0ZXh0SW5wdXQpO1xuXG4gICAgICAgICAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGlucHV0V3JhcHBlcik7XG4gICAgICAgICAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKHNlbmRCdXR0b24pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvb3RlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiY3JlYXRlV2lkZ2V0XCI6IGZ1bmN0aW9uICh3aWRnZXRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdpZGdldEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICBwcm9wcy5lbmFibGVGZWVkYmFjayA9IHdpZGdldENvbmZpZ3MuZW5hYmxlRmVlZGJhY2s7XG5cbiAgICAgICAgICAgICAgICB3aWRnZXRFbC5jbGFzc0xpc3QuYWRkKFwiY29udmVyc2F0aW9uLXdpZGdldFwiKTtcblxuICAgICAgICAgICAgICAgIGlmICh3aWRnZXRDb25maWdzLmluY2x1ZGVIZWFkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpZGdldENvbmZpZ3MuY3VzdG9tTG9nbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuc2V0KFwiaGVhZGVyTG9nb1wiLCB3aWRnZXRDb25maWdzLmN1c3RvbUxvZ28pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdpZGdldEVsLmFwcGVuZENoaWxkKGJ1aWxkZXIuY3JlYXRlV2lkZ2V0SGVhZGVyKHdpZGdldENvbmZpZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aWRnZXRFbC5hcHBlbmRDaGlsZChidWlsZGVyLmNyZWF0ZVdpZGdldEJvZHkoKSk7XG4gICAgICAgICAgICAgICAgd2lkZ2V0RWwuYXBwZW5kQ2hpbGQoYnVpbGRlci5jcmVhdGVXaWRnZXRGb290ZXIoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldEVsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG59KCkpOyIsIi8qKlxuICogQ3JlYXRlZCBieSBkYW5pZWxhYnJhbyBvbiAxLzE2LzE3LlxuICovXG4oZnVuY3Rpb24gKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAod2luZG93LCBmYWN0b3J5LCBhcHBQaHJhc2VzKSB7XG5cblxuICAgICAgICB2YXIgc2VsZiA9IHtcbiAgICAgICAgICAgIFwibWV0aG9kc1wiOiB7XG4gICAgICAgICAgICAgICAgXCJhcHBlbmRUb0JveFwiOiBmdW5jdGlvbiAocGFyZW50Q29udGFpbmVyLCB3aWRnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBhcmVudENvbnRhaW5lcikuYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJlbnQgY29udGFpbmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcImNyZWF0ZVdpZGdldEluc3RhbmNlXCI6IGZ1bmN0aW9uICh3aWRnZXRDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gcmVxdWlyZShcIi4uL2VsZW1lbnRzL2VsZW1lbnRzLnNjcmlwdFwiKSgpLFxuICAgICAgICAgICAgICAgICAgICBidWlsZGVyID0gcmVxdWlyZShcIi4vY2hhdEJ1aWxkZXIuc2NyaXB0XCIpKGVsZW1lbnRzLCBmYWN0b3J5LCBhcHBQaHJhc2VzLCB3aW5kb3cuZG9jdW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQgPSBidWlsZGVyLmNyZWF0ZVdpZGdldCh3aWRnZXRDb25maWdzKSxcbiAgICAgICAgICAgICAgICAgICAgYm9keUVsO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdpZGdldENvbmZpZ3MucGFyZW50Q29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubWV0aG9kcy5hcHBlbmRUb0JveCh3aWRnZXRDb25maWdzLnBhcmVudENvbnRhaW5lciwgd2lkZ2V0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib2R5RWwgPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuXG59KCkpOyIsIi8qKlxuICogQ3JlYXRlZCBieSBkYW5pZWxhYnJhbyBvbiAxLzIzLzE3LlxuICovXG4vKlxuICogQHZlcnNpb246IDAuMVxuICogQGF1dGhvcjogR3VpbGhlcm1lIEhlbnJpcXVlIE9rYSBNYXJxdWVzXG4gKi9cbihmdW5jdGlvbigpe1xuXG5cbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgY3JlYXRlRHVtbXkgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc2VzLCBwYXJlbnQpe1xuICAgICAgICB2YXIgdGFyZ2V0ID0gcGFyZW50LFxuICAgICAgICAgICAgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicHJlXCIpO1xuICAgICAgICBkdW1teS5jbGFzc05hbWUgPSBjbGFzc2VzO1xuICAgICAgICBkdW1teS5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgICAgZHVtbXkuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICAgICAgZHVtbXkuc3R5bGUubGVmdCA9IFwiMHB4XCI7XG4gICAgICAgIGR1bW15LnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgIGR1bW15LnN0eWxlLm1heFdpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgIGR1bW15LnN0eWxlLnpJbmRleCA9IFwiLTFcIjtcbiAgICAgICAgZHVtbXkuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgICAgICBkdW1teS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgZHVtbXkuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgICAgICBkdW1teS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGR1bW15KTtcbiAgICAgICAgcmV0dXJuIGR1bW15O1xuICAgIH07XG4gICAgdmFyIHVwZGF0ZVNpemUgPSBmdW5jdGlvbihlbGVtZW50LCBkdW1teSwgbWluV2lkdGgpe1xuICAgICAgICBkdW1teS50ZXh0Q29udGVudCA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUud2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgZHVtbXkub2Zmc2V0V2lkdGgpICsgXCJweFwiO1xuICAgIH07XG4gICAgdmFyIHJlc2V0U2l6ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIGR1bW15LCBtaW5XaWR0aCl7XG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLndpZHRoID0gbWluV2lkdGggKyBcInB4XCI7XG4gICAgICAgIGR1bW15LnRleHRDb250ZW50ID0gXCJcIjtcbiAgICB9O1xuICAgIHZhciBhcHBseSA9IGZ1bmN0aW9uKGNvbmZpZyl7XG5cbiAgICAgICAgdmFyIGR1bW15ID0gY3JlYXRlRHVtbXkoY29uZmlnLmhhbmRsZXIsIGNvbmZpZy5jbGFzc2VzLCBjb25maWcucGFyZW50KTtcbiAgICAgICAgY29uZmlnLmhhbmRsZXIub25pbnB1dCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgdXBkYXRlU2l6ZSh0aGlzLCBkdW1teSwgY29uZmlnLm1pbldpZHRoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVzZXRTaXplKGNvbmZpZy5oYW5kbGVyLCBkdW1teSwgY29uZmlnLm1pbldpZHRoKTtcbiAgICB9O1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2V0dXApe1xuICAgICAgICBhcHBseSh7XG4gICAgICAgICAgICBoYW5kbGVyOiBzZXR1cC5oYW5kbGVyLFxuICAgICAgICAgICAgbWluV2lkdGg6IHNldHVwLm1pbldpZHRoIHx8IDEwLFxuICAgICAgICAgICAgY2xhc3NlczogKHNldHVwLmNsYXNzZXMgfHwgXCJcIikgKyBcIiBkeW5hbWljSW5wdXREdW1teVwiLFxuICAgICAgICAgICAgcGFyZW50OiBzZXR1cC5wYXJlbnQgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIilcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pKCk7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGRhbmllbGFicmFvIG9uIDEvMTcvMTcuXG4gKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRMaXN0ID0ge1xuICAgICAgICAgICAgXCJodG1sQm9keVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJ3aWRnZXRFbFwiOiBcIlwiLFxuICAgICAgICAgICAgXCJjaGF0SGVhZGVyXCI6IFwiXCIsXG4gICAgICAgICAgICBcImNoYXRXcmFwcGVyXCI6IFwiXCIsXG4gICAgICAgICAgICBcImNoYXRFbFwiOiBcIlwiLFxuICAgICAgICAgICAgXCJmZWVkYmFja0VsXCI6IFwiXCIsXG4gICAgICAgICAgICBcImNoYXRGb290ZXJcIjogXCJcIixcbiAgICAgICAgICAgIFwibG9hZGluZ0VsXCI6IFwiXCIsXG4gICAgICAgICAgICBcImlucHV0RWxcIjogXCJcIixcbiAgICAgICAgICAgIFwiaGVhZGVyTG9nb1wiOiBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCbGJtTnZaR2x1WnowaWRYUm1MVGdpUHo0S1BITjJaeUIyWlhKemFXOXVQU0l4TGpFaUlHbGtQU0pNWVhsbGNsOHhJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGh0Ykc1ek9uaHNhVzVyUFNKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eE9UazVMM2hzYVc1cklpQjRQU0l3Y0hnaUlIazlJakJ3ZUNJS0NTQjJhV1YzUW05NFBTSXdJREFnTlRBZ05UQWlJSGh0YkRwemNHRmpaVDBpY0hKbGMyVnlkbVVpUGdvOGNHRjBhQ0JwWkQwaVYyRjBjMjl1WDBGMllYUmhjbDlHYkdGMFh6UmZJaUJtYVd4c1BTSWpOVUZCUVVaQklpQmtQU0pOT0M0MExESXdMamhqTFRBdU1Td3dMVEF1TXl3d0xUQXVOQzB3TGpGc0xUUXVNaTB5TGpSRE15NHpMREU0TERNdU1pd3hOeTQwTERNdU5Dd3hOd29KWXpBdU1pMHdMalFzTUM0NExUQXVOaXd4TGpJdE1DNHpiRFF1TWl3eUxqUmpNQzQwTERBdU1pd3dMallzTUM0NExEQXVNeXd4TGpKRE9Td3lNQzQyTERndU55d3lNQzQ0TERndU5Dd3lNQzQ0ZWlCTk1UWXNNVE11TldNd0xqUXRNQzR5TERBdU5pMHdMamdzTUM0ekxURXVNbXd0TWk0MExUUXVNZ29KWXkwd0xqSXRNQzQwTFRBdU9DMHdMall0TVM0eUxUQXVNMk10TUM0MExEQXVNaTB3TGpZc01DNDRMVEF1TXl3eExqSnNNaTQwTERRdU1tTXdMaklzTUM0ekxEQXVOU3d3TGpRc01DNDRMREF1TkVNeE5TNDNMREV6TGpZc01UVXVPU3d4TXk0MUxERTJMREV6TGpWNklFMHlOaTR5TERFd0xqRldOUzR5Q2dsak1DMHdMalV0TUM0MExUQXVPUzB3TGprdE1DNDVZeTB3TGpVc01DMHdMamtzTUM0MExUQXVPU3d3TGpsMk5DNDRZekFzTUM0MUxEQXVOQ3d3TGprc01DNDVMREF1T1VNeU5TNDRMREV4TERJMkxqSXNNVEF1Tml3eU5pNHlMREV3TGpGNklFMHpOUzQ1TERFekxqRnNNaTQwTFRRdU1nb0pZekF1TWkwd0xqUXNNQzR4TFRFdE1DNHpMVEV1TW1NdE1DNDBMVEF1TWkweExUQXVNUzB4TGpJc01DNHpiQzB5TGpRc05DNHlZeTB3TGpJc01DNDBMVEF1TVN3eExEQXVNeXd4TGpKak1DNHhMREF1TVN3d0xqTXNNQzR4TERBdU5Dd3dMakVLQ1VNek5TNDFMREV6TGpZc016VXVPQ3d4TXk0MExETTFMamtzTVRNdU1Yb2dUVFF5TGpnc01qQXVObXcwTGpJdE1pNDBZekF1TkMwd0xqSXNNQzQyTFRBdU9Dd3dMak10TVM0eVl5MHdMakl0TUM0MExUQXVPQzB3TGpZdE1TNHlMVEF1TTJ3dE5DNHlMREl1TkFvSll5MHdMalFzTUM0eUxUQXVOaXd3TGpndE1DNHpMREV1TW1Nd0xqSXNNQzR6TERBdU5Td3dMalFzTUM0NExEQXVORU0wTWk0MUxESXdMamdzTkRJdU55d3lNQzQzTERReUxqZ3NNakF1Tm5vZ1RUSTJMakVzTVRRdU0yTXRNUzQyTERBdE15NDBMREF1TkMwMExqVXNNQzQzQ2dsakxUQXVNU3d3TFRBdU1pd3dMakV0TUM0eUxEQXVNbU13TERBdU1Td3dMakVzTUM0eUxEQXVNaXd3TGpKak1DNHhMREFzTUM0ekxUQXVNU3d3TGpVdE1DNHhZekF1T1Mwd0xqRXNNUzQwTFRBdU1pd3lMamN0TUM0eVl6RXVOU3d3TERJdU9Td3dMak1zTkM0MExEQXVPQW9KUXpJekxqUXNNVGdzTVRjdU55d3lOUzQ1TERFMUxqZ3NNek5qTFRJdU1TMHlMak10TXk0MExUUXVPUzB6TGpRdE55NDBZekF0TkM0eExETXVOQzAyTGpZc09DNHpMVFl1Tm1Nd0xqSXNNQ3d3TGpNc01Dd3dMalFzTUdNd0xqRXNNQ3d3TGpFdE1DNHhMREF1TVMwd0xqSUtDV013TFRBdU1TMHdMakV0TUM0eExUQXVNaTB3TGpKakxUQXVNeTB3TGpFdE1TNHhMVEF1TVMweExqa3RNQzR4WXkwMExqa3NNQzA0TGpVc01pNDFMVGd1TlN3M0xqRmpNQ3d6TGpFc01TNDRMRFl1TlN3MExqY3NPUzQwWXkwd0xqSXNNUzB3TGpNc01pMHdMak1zTWk0NUNnbGpNQ3d3TGpRc01Dd3hMakVzTUM0eUxERXVPV010TVM0M0xURXVOUzB6TFRNdU15MHpMamN0TlM0eVl5MHdMakV0TUM0MExUQXVOQzB4TGpFdE1DNDFMVEV1TTJNd0xUQXVNUzB3TGpFdE1DNHlMVEF1TWkwd0xqSmpMVEF1TVN3d0xUQXVNaXd3TGpFdE1DNHlMREF1TWdvSll6QXNNQzR4TERBc01DNDBMREF1TVN3d0xqVmpNU3cxTGpJc05pNHlMREV4TGpnc01UUXVOaXd4TVM0NFl6a3VOQ3d3TERFMUxqZ3ROeTQzTERFMUxqZ3RNVFV1T0VNME1TNHlMREl4TGpRc016UXVPQ3d4TkM0ekxESTJMakVzTVRRdU0zb2dUVEkxTGpNc05ETXVOd29KWXkwekxEQXROUzQyTFRFdU1TMDJMamN0TVM0M1l5MHhMalV0TUM0NExURXVPUzB5TGpJdE1TNDVMVFF1TVdNd0xUQXVOU3d3TFRFdU1Td3dMakV0TVM0Mll6TXVOeXd6TGpFc09DNDNMRFV1TXl3eE15NDJMRFV1TTJNeExqRXNNQ3d5TGpFdE1DNHlMRE10TUM0MGJEQXNNQW9KUXpNeExqa3NOREl1TkN3eU9DNDVMRFF6TGpjc01qVXVNeXcwTXk0M2VpQk5NekF1TkN3ek9TNDVZeTAwTGpjc01DMDVMamN0TWk0ekxURXpMakl0TlM0MVl6RXVPQzA0TGpJc09TNHlMVEUzTGpNc01UTXVPUzB4Tnk0ell6QXVOU3d3TERFc01DNHhMREV1Tml3d0xqVUtDV013TGprc01DNDJMREV1T0N3eExqTXNNaTQxTERKak1pNHlMREl1TVN3MExqSXNOUzQzTERRdU1pd3hNQzR4WXpBc015NDBMVEV1TWl3MkxqRXRNaTQwTERjdU4wTXpOUzQyTERNNUxqSXNNek11TVN3ek9TNDVMRE13TGpRc016a3VPWG9pTHo0S1BDOXpkbWMrXCIsXG4gICAgICAgICAgICBcIndhdHNvblBpY1wiOiBcIlwiXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudExpc3RbZWxdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50TGlzdFtlbF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBFbGVtZW50IHJlcXVpcmVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbiAoZWwsIHZhbCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRMaXN0W2VsXSA9IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG59KCkpOyIsIi8qKlxuICogQ3JlYXRlZCBieSBkYW5pZWxhYnJhbyBvbiAxLzE2LzE3LlxuICovXG4oZnVuY3Rpb24gKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAod2luZG93KSB7XG5cbiAgICAgICAgdmFyIGNvbnZlcnNhdGlvbkNvbnRleHQgPSB7fTtcbiAgICAgICAgdmFyIHVybHMgPSB7XG4gICAgICAgICAgICBcImZlZWRiYWNrXCI6IFwiXCIsXG4gICAgICAgICAgICBcImNvbnZlcnNhdGlvblwiOiBcIlwiXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwic2V0VXJsXCI6IGZ1bmN0aW9uICh1cmwsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICB1cmxzW3R5cGVdID0gdXJsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0VXJsXCI6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVybHNbdHlwZV07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJtYWtlUXVlc3Rpb25cIjogZnVuY3Rpb24gKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnZlcnNhdGlvbkNvbnRleHQgPSByZXNwb25zZS5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLm9wZW4oXCJQT1NUXCIsIHVybHMuY29udmVyc2F0aW9uLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHR0cC5zZW5kKFtcInF1ZXN0aW9uPVwiLCBxdWVzdGlvbiwgXCImY29udGV4dD1cIiwgSlNPTi5zdHJpbmdpZnkoY29udmVyc2F0aW9uQ29udGV4dCldLmpvaW4oXCJcIikpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFwiQUpBWCBDYWxscyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3NlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2VuZEZlZWRiYWNrXCI6IGZ1bmN0aW9uIChvcHRpb24sIGZlZWRiYWNrT2JqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLm9wZW4oXCJQT1NUXCIsIHVybHMuZmVlZGJhY2ssIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLnNlbmQoW1wib3B0aW9uPVwiLCBvcHRpb24sIFwiJmZlZWRiYWNrPVwiLCBKU09OLnN0cmluZ2lmeShmZWVkYmFja09iaiksIFwiJmNvbnRleHQ9XCIsIGNvbnZlcnNhdGlvbkNvbnRleHRdLmpvaW4oXCJcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coW1wib3B0aW9uPVwiLCBvcHRpb24sIFwiJmZlZWRiYWNrPVwiLCBKU09OLnN0cmluZ2lmeShmZWVkYmFja09iaiksIFwiJmNvbnRleHQ9XCIsIGNvbnZlcnNhdGlvbkNvbnRleHRdLmpvaW4oXCJcIikpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoXCJBSkFYIENhbGxzIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBicm93c2VyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG5cbn0oKSk7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGRhbmllbGFicmFvIG9uIDEvMTYvMTcuXG4gKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgZ2xvYmFsLFxuICAgICAgICBhcHBQaHJhc2VzLFxuICAgICAgICBhcHBMYW5ndWFnZSxcbiAgICAgICAgZmFjdG9yeSxcbiAgICAgICAgY29udHJvbGxlcjtcblxuICAgIHRyeSB7XG4gICAgICAgIGdsb2JhbCA9IHdpbmRvdyB8fCBcIlwiO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJOb2RlIEpTIGVudmlyb25tZW50XCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnZlcnNhdGlvbldpZGdldCAod2luZG93T2JqKSB7XG4gICAgICAgIHZhciB3aW5kb3cgPSBnbG9iYWwgfHwgd2luZG93T2JqO1xuXG4gICAgICAgIGlmICghd2luZG93KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaW5kb3cgb2JqZWN0IGlzIG5vdCBwcmVzZW50XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwTGFuZ3VhZ2UgPSAod2luZG93Lm5hdmlnYXRvci5sYW5ndWFnZXMgJiYgd2luZG93Lm5hdmlnYXRvci5sYW5ndWFnZXNbMF0pIHx8IC8vIENocm9tZSAvIEZpcmVmb3hcbiAgICAgICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLmxhbmd1YWdlIHx8ICAgLy8gQWxsIGJyb3dzZXJzXG4gICAgICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci51c2VyTGFuZ3VhZ2U7XG5cbiAgICAgICAgICAgIGFwcFBocmFzZXMgPSByZXF1aXJlKFwiLi9tb2RlbC9pbnRlcm5hdGlvbmFsaXphdGlvbi5zY3JpcHRcIikoYXBwTGFuZ3VhZ2UpO1xuICAgICAgICAgICAgZmFjdG9yeSA9IHJlcXVpcmUoXCIuL2ZhY3RvcnkvZmFjdG9yeS5zY3JpcHRcIikod2luZG93KTtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9jb250cm9sbGVyL2NvbnRyb2xsZXIuc2NyaXB0XCIpKHdpbmRvdywgZmFjdG9yeSwgYXBwUGhyYXNlcyk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCJpbml0XCI6IGZ1bmN0aW9uIChjb25maWdzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maWdzLmJhc2VVUkwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgcHJvY2VlZCB3aXRob3V0IGEgdmFsaWQgVVJMXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3MuZW5hYmxlRmVlZGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29uZmlncy5mZWVkYmFja0VuZHBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgcHJvdmlkZSBhIGZlZWRiYWNrIGVuZHBvaW50IHdoZW5ldmVyIGVuYWJsZUZlZWRiYWNrIGlzIHRydWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhY3Rvcnkuc2V0VXJsKGNvbmZpZ3MuZmVlZGJhY2tFbmRwb2ludCwgXCJmZWVkYmFja1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZhY3Rvcnkuc2V0VXJsKGNvbmZpZ3MuYmFzZVVSTCwgXCJjb252ZXJzYXRpb25cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuY3JlYXRlV2lkZ2V0SW5zdGFuY2UoY29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChnbG9iYWwpIHtcbiAgICAgICAgZ2xvYmFsLmNvbnZlcnNhdGlvbldpZGdldCA9IGNvbnZlcnNhdGlvbldpZGdldChnbG9iYWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gY29udmVyc2F0aW9uV2lkZ2V0O1xuICAgIH1cblxufSgpKTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgZGFuaWVsYWJyYW8gb24gMS8xOC8xNy5cbiAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBsYW5ndWFnZXMgPSB7XG4gICAgICAgIFwicHRcIjoge1xuICAgICAgICAgICAgXCJ3YXRzb25OZWdhdGl2ZVwiOiBcIkluZmVsaXptZW50ZSBuw6NvIGVudGVuZGkuIFRlbnRlIHBlcmd1bnRhciBjb20gb3V0cmFzIHBhbGF2cmFzXCIsXG4gICAgICAgICAgICBcImZlZWRiYWNrRGlzY2xhaW1lclwiOiBcIklzc28gYWp1ZG91P1wiLFxuICAgICAgICAgICAgXCJmZWVkYmFja1llc0J0blwiOiBcIlNpbVwiLFxuICAgICAgICAgICAgXCJmZWVkYmFja05vQnRuXCI6IFwiTsOjb1wiXG4gICAgICAgIH0sXG4gICAgICAgIFwiZW5cIjoge1xuICAgICAgICAgICAgXCJ3YXRzb25OZWdhdGl2ZVwiOiBcIkkgZGlkIG5vdCB1bmRlcnN0b29kLiBUcnkgd2l0aCBhbm90aGVyIHdvcmRzXCIsXG4gICAgICAgICAgICBcImZlZWRiYWNrRGlzY2xhaW1lclwiOiBcIkRpZCBpdCBoZWxwP1wiLFxuICAgICAgICAgICAgXCJmZWVkYmFja1llc0J0blwiOiBcIlllc1wiLFxuICAgICAgICAgICAgXCJmZWVkYmFja05vQnRuXCI6IFwiTm9cIlxuICAgICAgICB9LFxuICAgICAgICBcImVzXCI6IHtcbiAgICAgICAgICAgIFwid2F0c29uTmVnYXRpdmVcIjogXCJcIixcbiAgICAgICAgICAgIFwiZmVlZGJhY2tEaXNjbGFpbWVyXCI6IFwiXCIsXG4gICAgICAgICAgICBcImZlZWRiYWNrWWVzQnRuXCI6IFwiXCIsXG4gICAgICAgICAgICBcImZlZWRiYWNrTm9CdG5cIjogXCJcIlxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY291bnRyeUNvZGUpIHtcbiAgICAgICAgcmV0dXJuIGxhbmd1YWdlc1tjb3VudHJ5Q29kZV0gfHwgbGFuZ3VhZ2VzLmVuO1xuICAgIH07XG5cblxufSgpKTsiXX0=
