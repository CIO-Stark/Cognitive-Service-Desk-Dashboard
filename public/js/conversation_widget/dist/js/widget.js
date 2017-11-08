(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by danielabrao on 1/17/17.
 */
(function () {
    "use strict";

    module.exports = function (elements, factory, appPhrases, document) {


        var dynamicInput = require("./dynamicInput.script")(document);
        var props = {
            "enableFeedback": false,
            "negativeCounter": 0,
            "chatHistory": [],
            "extraOptions": [],
            "lastQuestion": ""
        };

        var methods = {
    		"sendWelcomeMsg": function () {
                var userObject = factory.getLogin(),
                    user,
                    welcomeMsg = appPhrases.chat.watsonWelcome;

                if (userObject && userObject.name) {
                    user = userObject.name;
                } else {
                    user = "User";
                }

                methods.sendQuestion("hello");

                // builder.buildChatBubble(welcomeMsg.replace(/\{user\}/, user.charAt(0).toUpperCase() + user.substring(1)), "watson");
            },	
        		
        	/*	
            "sendWelcomeMsg": function () {
                var userObject = factory.getLogin(),
                    user,
                    welcomeMsg = appPhrases.chat.watsonWelcome;

                if (userObject && userObject.name) {
                    user = userObject.name;
                } else {
                    user = "User";
                }

                builder.buildChatBubble(welcomeMsg.replace(/\{user\}/, user.charAt(0).toUpperCase() + user.substring(1)), "watson");
            },*/
            "clearRawInput": function (userText) {
                return userText.replace(/<[^>]*>/g, "");
            },
            "sendQuestion": function (text) {
                methods.blockUI().showLoad().setLastQuestion(text);
                factory.makeQuestion(text).then(function successCB(answer) {
                    if (answer.hasOwnProperty("output") && answer.output.text.length) {
                        builder.buildChatBubble(answer.output.text[0], "watson");

                        if (answer.intents.length || answer.entities.length) {
                            if (props.enableFeedback) {
                                methods.toggleFeedbackOptions();
                            }
                        }

                    } else {
                        builder.buildChatBubble(appPhrases.chat.watsonNegative, "watson");
                    }
                }, function errorCB(error) {
                    console.log(error);
                    builder.buildChatBubble(appPhrases.chat.watsonError, "watson");
                }).then(function () {
                    methods.releaseUI().hideLoad().scrollChatToBottom();
                });

                return this;
            },
            "getExtraOptions": function () {
                if (props.negativeCounter < 1) {
                    methods.blockUI().showLoad();
                    factory.getExtraOptions(props.lastQuestion).then(function successCB (extraOptions) {
                        if (extraOptions) {
                            methods.setExtraOptions(extraOptions);
                            builder.createExtraOptions(props.extraOptions);
                        }

                        props.negativeCounter += 1;
                    }, function errorCB (err) {
                        methods.sendFeedback("negative", {
                            "id": "x",
                            "user": factory.getLogin() || "anonymous",
                            "chatHistory": props.chatHistory,
                            "error": err
                        });
                    }).then(function () {
                        methods.toggleFeedbackOptions().releaseUI().hideLoad()
                    });
                } else {
                    methods.sendFeedback("negative", {
                        "id": "x",
                        "user": factory.getLogin() || "anonymous",
                        "chatHistory": props.chatHistory
                    });
                }
            },
            "toggleFeedbackOptions": function () {
                elements.get("feedbackEl").classList.toggle("show-feedback");
                return this;
            },
            "sendFeedback": function (option, payload) {
                methods.blockUI().showLoad();
                factory.sendFeedback(option, payload).then(function successCB(data) {
                    console.log(data);
                }, function errorCB(error) {
                    console.log(error);
                }).then(function () {
                    builder.buildChatBubble(appPhrases.chat.watsonFeedback, "watson");
                    if (elements.get("feedbackEl").classList.contains("show-feedback")) {
                        methods.toggleFeedbackOptions();
                    }
                    methods.releaseUI().hideLoad();
                });

                return this;
            },
            "scrollChatToBottom": function () {
                elements.get("chatWrapper").scrollTop = elements.get("chatWrapper").scrollHeight;
                return this;
            },
            "showLoad": function () {
                elements.get("buttonIconHolder").src = elements.get("loadingIcon");
                return this;
            },
            "hideLoad": function () {
                elements.get("buttonIconHolder").src = elements.get("sendBtnIcon");
                return this;
            },
            "updateInputStyle": function () {
                var textInput = elements.get("inputEl");
                if (textInput.value) {
                    textInput.style.borderBottom = "3px solid black";
                } else {
                    textInput.style.borderBottom = "0";
                }
                return this;
            },
            "cleanInput": function () {
                elements.get("inputEl").value = "";
                return this;
            },
            "inputFocus": function () {
                elements.get("inputEl").focus();
                return this;
            },
            "appendMsgToHistory": function (msgObj) {
                if (msgObj) {
                    props.chatHistory.push(msgObj);
                }
                return this;
            },
            "setExtraOptions": function (extraOptions) {
                props.extraOptions = extraOptions || [];
                return this;
            },
            "setLastQuestion": function (question) {
                props.lastQuestion = question || "";
                return this;
            },
            "blockUI": function () {
                elements.get("inputWrapper").classList.add("disabled");
                elements.get("sendBtn").classList.add("disabled");
                elements.get("inputEl").setAttribute("disabled", true);
                return this;
            },
            "releaseUI": function () {
                elements.get("inputWrapper").classList.remove("disabled");
                elements.get("sendBtn").classList.remove("disabled");
                elements.get("inputEl").removeAttribute("disabled");
                return this;
            }
        };

        var builder = {
            "buildCustomProperties": function (widgetConfigs) {
                props.enableFeedback = widgetConfigs.enableFeedback;

                if (widgetConfigs.hasOwnProperty("customTitle")) {
                    if (widgetConfigs.customTitle && typeof widgetConfigs.customTitle === "string") {
                        elements.set("titleText", widgetConfigs.customTitle);
                    } else {
                        throw new Error("customTitle must be a valid text property");
                    }
                }

                if (widgetConfigs.customLogo) {
                    elements.set("headerLogo", widgetConfigs.customLogo);
                }

                return this;

            },
            "attachListener": function (listener, el, cb) {
                try {
                    el.addEventListener(listener, cb);
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
            "createWidgetHeader": function () {
                var header = document.createElement("header"),
                    logoImg = document.createElement("img"),
                    headerTitle = document.createElement("h2");

                logoImg.setAttribute("alt", "Custom logo");
                logoImg.src = elements.get("headerLogo");
                logoImg.onerror = function () {
                    logoImg.src = "http://placehold.it/48x48";
                };
                headerTitle.appendChild(document.createTextNode(elements.get("titleText")));

                header.appendChild(logoImg);
                header.appendChild(headerTitle);
                header.classList.add("widget-header");

                return header;
            },
            "createWidgetBody": function () {
                var chatWrapper = document.createElement("div"),
                    chatEl = document.createElement("div");

                chatWrapper.classList.add("widget-body");
                chatEl.classList.add("widget-chat");

                elements.set("chatWrapper", chatWrapper);
                elements.set("chatEl", chatEl);

                if (props.enableFeedback) {
                    var feedbackDiv = document.createElement("div"),
                        feedbackDisclaimer = document.createElement("label"),
                        buttonBox = document.createElement("div"),
                        positiveBtn = document.createElement("button"),
                        negativeBtn = document.createElement("button");

                    builder.attachListener("click", positiveBtn, function () {
                        methods.sendFeedback("positive", {
                            "id": "x",
                            "user": factory.getLogin() || "anonymous",
                            "chatHistory": props.chatHistory
                        });
                        props.negativeCounter = 0;
                    });

                    builder.attachListener("click", negativeBtn, methods.getExtraOptions);

                    feedbackDiv.classList.add("feedback-session");

                    feedbackDisclaimer.appendChild(document.createTextNode(appPhrases.elements.feedbackDisclaimer));
                    positiveBtn.appendChild(document.createTextNode(appPhrases.elements.feedbackYesBtn));
                    negativeBtn.appendChild(document.createTextNode(appPhrases.elements.feedbackNoBtn));

                    feedbackDiv.appendChild(feedbackDisclaimer);
                    buttonBox.appendChild(positiveBtn);
                    buttonBox.appendChild(negativeBtn);
                    feedbackDiv.appendChild(buttonBox);

                    elements.set("feedbackEl", feedbackDiv);

                    chatEl.appendChild(feedbackDiv);
                }

                chatWrapper.appendChild(chatEl);
                //methods.sendWelcomeMsg(factory.getLogin());
                return chatWrapper;
            },
            "buildChatBubble": function (textInput, sender) {
                var self = this;
                if (!textInput) {
                    return;
                } else {
                    textInput = methods.clearRawInput(textInput);
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
                methods.scrollChatToBottom().appendMsgToHistory({
                    "text": textInput,
                    "source": sender || "user"
                });
                return self;
            },
            "createExtraOptions": function (optionsArr) {
                if (!Array.isArray(optionsArr)) {
                    return false;
                }

                if (!optionsArr.length) {
                    return false;
                }

                methods.blockUI();

                var outerDiv = document.createElement("div");
                outerDiv.classList.add("extra-options-container");

                optionsArr.forEach(function (option) {

                    //DECLARATIONS
                    var optionWrapper = document.createElement("div"),
                        optionDiv = document.createElement("div"),
                        optionCanonical = document.createElement("span"),
                        supportButton = document.createElement("span"),
                        optionExpansible = document.createElement("div"),
                        optionAnswer = document.createElement("div"),
                        optionFeedback = document.createElement("div"),
                        feedbackText = document.createElement("span"),
                        feedbackImg = document.createElement("img"),
                        featuredAnswer = document.createElement("div"),
                        poweredByLogo = document.createElement("img");

                    //SETUPS
                    // supportButton.setAttribute("src", elements.get("downIcon"));
                    feedbackImg.setAttribute("src", elements.get("checkmarkIcon"));
                    optionWrapper.classList.add("slide");
                    optionDiv.classList.add("extra-option");
                    optionDiv.classList.add(option.source);
                    optionCanonical.classList.add("canonical-question");
                    optionExpansible.classList.add("expansible");
                    optionExpansible.classList.add("option-box");
                    optionAnswer.classList.add("option-text");
                    optionFeedback.classList.add("option-feedback");
                    featuredAnswer.classList.add("featured-answer");
                    supportButton.classList.add("icon");
                    poweredByLogo.setAttribute("src", elements.get(option.source + "Logo"));
                    poweredByLogo.setAttribute("alt", option.source);

                    builder.attachListener("click", optionDiv, function () {
                        console.log(option);
                        optionExpansible.classList.toggle("expansible");
                        optionExpansible.classList.toggle("closable");
                        supportButton.classList.toggle("up");
                    });

                    builder.attachListener("click", optionFeedback, function () {
                        elements.get("chatEl").removeChild(outerDiv);

                        methods.appendMsgToHistory({
                            "text": option.answer,
                            "source": "extraOptions"
                        });

                        methods.sendFeedback("positive", {
                            "id": "x",
                            "user": factory.getLogin() || "anonymous",
                            "chatHistory": props.chatHistory,
                            "extraOptions": optionsArr
                        });

                        methods.setExtraOptions().releaseUI();
                    });

                    //APPEND

                    optionCanonical.appendChild(document.createTextNode(option.canonical));

                    optionDiv.appendChild(poweredByLogo);
                    optionDiv.appendChild(optionCanonical);
                    optionDiv.appendChild(supportButton);

                    optionAnswer.appendChild(document.createTextNode(option.answer));

                    feedbackText.appendChild(document.createTextNode(appPhrases.elements.extraOptionFeedback));

                    optionFeedback.appendChild(feedbackText);
                    optionFeedback.appendChild(feedbackImg);

                    optionExpansible.appendChild(optionAnswer);
                    optionExpansible.appendChild(optionFeedback);

                    optionWrapper.appendChild(optionDiv);
                    optionWrapper.appendChild(optionExpansible);

                    outerDiv.appendChild(optionWrapper);
                });

                var negativeFeedbackWrapper = document.createElement("div"),
                    negativeFeedbackDiv = document.createElement("div"),
                    negativeFeedbackText = document.createElement("span"),
                    negativeFeedbackImg = document.createElement("img");
                negativeFeedbackWrapper.classList.add("negative-feedback-wrapper");
                negativeFeedbackDiv.classList.add("option-feedback");

                negativeFeedbackImg.setAttribute("src", elements.get("cancelIcon"));

                negativeFeedbackText.appendChild(document.createTextNode(appPhrases.elements.extraOptionsNegativeFeedback));
                negativeFeedbackDiv.appendChild(negativeFeedbackText);
                negativeFeedbackDiv.appendChild(negativeFeedbackImg);

                builder.attachListener("click", negativeFeedbackDiv, function () {
                    elements.get("chatEl").removeChild(outerDiv);

                    methods.sendFeedback("negative", {
                        "id": "x",
                        "user": factory.getLogin() || "anonymous",
                        "chatHistory": props.chatHistory,
                        "extraOptions": optionsArr
                    });

                    methods.setExtraOptions().releaseUI();
                });


                negativeFeedbackWrapper.appendChild(negativeFeedbackDiv);

                outerDiv.appendChild(negativeFeedbackWrapper);

                elements.get("chatEl").appendChild(outerDiv);
                methods.scrollChatToBottom();
            },
            "createWidgetFooter": function () {
                var self = this,
                    footer = document.createElement("div"),
                    inputWrapper = document.createElement("p"),
                    inputLabel = document.createElement("label"),
                    textInput = document.createElement("input"),
                    sendButton = document.createElement("button"),
                    buttonIcon = document.createElement("img");

                var buttonListener = function () {
                    if (textInput.value) {
                        builder.buildChatBubble(textInput.value);
                        methods.sendQuestion(textInput.value).cleanInput().updateInputStyle();
                    }
                };

                dynamicInput({
                    "handler": textInput,
                    "minWidth": 25,
                    "parent": inputWrapper
                });


                footer.classList.add("widget-footer");
                inputWrapper.classList.add("input-wrapper");

                inputLabel.setAttribute("for", "widget-input");
                inputLabel.innerHTML = appPhrases.elements.inputPlaceholder;
                textInput.setAttribute("type", "text");
                textInput.setAttribute("id", "widget-input");

                builder.attachListener("focus", textInput, function () {
                    inputLabel.innerHTML = "";
                });

                builder.attachListener("blur", textInput, function () {
                    if (!textInput.value) {
                        inputLabel.innerHTML = appPhrases.elements.inputPlaceholder;
                    }
                });

                self.attachListener("click", inputWrapper, methods.inputFocus);
                self.attachListener("click", sendButton, buttonListener);
                self.attachKeyListener(textInput, buttonListener, methods.updateInputStyle);

                buttonIcon.src = elements.get("sendBtnIcon");

                sendButton.appendChild(buttonIcon);

                inputWrapper.appendChild(inputLabel);
                inputWrapper.appendChild(textInput);

                footer.appendChild(inputWrapper);
                footer.appendChild(sendButton);

                elements.set("inputWrapper", inputLabel);
                elements.set("inputEl", textInput);
                elements.set("sendBtn", sendButton);
                elements.set("buttonIconHolder", buttonIcon);

                return footer;
            }
        };
        return {
            "createWidget": function (widgetConfigs) {
                var widgetEl = document.createElement("div");
                widgetEl.classList.add("conversation-widget");

                builder.buildCustomProperties(widgetConfigs);

                if (widgetConfigs.includeHeader) {
                    widgetEl.appendChild(builder.createWidgetHeader());
                }

                widgetEl.appendChild(builder.createWidgetBody());
                widgetEl.appendChild(builder.createWidgetFooter());
                
                
                methods.sendWelcomeMsg(factory.getLogin());
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
                    loginEngine = require("./login.script")(elements, factory, appPhrases, window.document),
                    widget,
                    bodyEl;

                if (widgetConfigs.parentContainer) {
                    if (widgetConfigs.enableLogin) {
                        loginEngine.init(widgetConfigs).then(function () {
                            widget = builder.createWidget(widgetConfigs);
                            self.methods.appendToBox(widgetConfigs.parentContainer, widget);
                        }, function (err) {
                            console.log(err);
                        });
                    } else {
                        widget = builder.createWidget(widgetConfigs);
                        self.methods.appendToBox(widgetConfigs.parentContainer, widget);
                    }


                } else {
                    bodyEl = window.document.querySelector("body");
                }

            }
        };
    };


}());
},{"../elements/elements.script":6,"./chatBuilder.script":1,"./login.script":4}],3:[function(require,module,exports){
/**
 * Created by danielabrao on 1/23/17.
 */
/*
 * @version: 0.1
 * @author: Guilherme Henrique Oka Marques
 */
(function(){

    var document = document || "";

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
    module.exports = function(documentObj){
        document = documentObj;
        return function (setup) {
            return apply({
                handler: setup.handler,
                minWidth: setup.minWidth || 10,
                classes: (setup.classes || "") + " dynamicInputDummy",
                parent: setup.parent || document.querySelector("body")
            });
        }


    };
})();
},{}],4:[function(require,module,exports){
/**
 * Created by danielabrao on 1/23/17.
 */
(function () {
    "use strict";

    module.exports = function (elements, factory, appPhrases, document) {

        var parentElement;

        var methods = {
            "addRelativePositionToParent": function (parent) {
                parent.style.position = "relative";
            }
        };
        var builder = {
            "buildCopyrightDisclaimer": function () {
                var div = document.createElement("div");
                div.classList.add("copyright-disclaimer");
                div.appendChild(document.createTextNode([new Date().getFullYear(), "IBM"].join(" ")));
                return div;
            },
            "buildMainImage": function (customLogo) {
                var wrapper = document.createElement("div"),
                    img = document.createElement("img");

                img.src = customLogo || elements.get("headerLogo");
                wrapper.appendChild(img);

                return wrapper;
            },
            "buildInputField": function (name, type, required, label) {
                var inputWrapper = document.createElement("div"),
                    inputLabel = document.createElement("label"),
                    input = document.createElement("input");

                inputWrapper.classList.add("login-input-wrapper");

                inputLabel.setAttribute("for", name);
                input.setAttribute("type", type);
                input.setAttribute("name", name);
                input.setAttribute("id", name);
                elements.set([name, "LoginInput"].join(""), input);

                inputLabel.appendChild(document.createTextNode(label));
                inputWrapper.appendChild(inputLabel);
                inputWrapper.appendChild(input);

                return inputWrapper;
            },
            "buildSendButton": function (buttonText, resolve, reject) {
                var btn = document.createElement("button");

                btn.appendChild(document.createTextNode(buttonText));
                btn.addEventListener("click", function () {
                    try {
                        var name = elements.get("nameLoginInput").value,
                            email = elements.get("emailLoginInput").value
                    } catch (e) {
                        return reject(appPhrases.error.invalidLoginFields);
                    }

                    if (!name || !email) {
                        return reject(appPhrases.error.emptyLoginFields);
                    }

                    factory.saveLogin({
                        "name": name,
                        "email": email
                    });

                    elements.get("loginWrapper").style.zIndex = -1;


                    resolve("logged");
                });

                return btn;
            },
            "buildLoginLayer": function (resolve, reject, widgetConfigs) {
                var layer = document.createElement("div");
                layer.classList.add("login-layer");


                var imgDiv = builder.buildMainImage(widgetConfigs.customLogo);

                layer.appendChild(imgDiv);

                var loginBodyDiv = document.createElement("div");
                loginBodyDiv.classList.add("login-body");
                loginBodyDiv.appendChild(builder.buildInputField("name", "text", true, appPhrases.elements.nameInputLabel));
                loginBodyDiv.appendChild(builder.buildInputField("email", "email", true, appPhrases.elements.emailInputLabel));
                loginBodyDiv.appendChild(builder.buildSendButton(appPhrases.elements.loginButton, resolve));
                layer.appendChild(loginBodyDiv);
                layer.appendChild(builder.buildCopyrightDisclaimer());
                return layer;
            }
        };


        return {
            "init": function (widgetConfigs){
                parentElement = document.querySelector(widgetConfigs.parentContainer);

                return new Promise(function (resolve, reject) {
                    if (factory.getLogin()) {
                        resolve("already logged");
                    } else {
                        var layer = builder.buildLoginLayer(resolve, reject, widgetConfigs);
                        methods.addRelativePositionToParent(parentElement);
                        elements.set("loginWrapper", layer);
                        parentElement.appendChild(layer);
                    }
                });
            }
        };


    };


}());
},{}],5:[function(require,module,exports){
/**
 * Created by danielabrao on 2/14/17.
 */
!function(e){function n(){}function t(e,n){return function(){e.apply(n,arguments)}}function o(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],s(e,this)}function i(e,n){for(;3===e._state;)e=e._value;return 0===e._state?void e._deferreds.push(n):(e._handled=!0,void o._immediateFn(function(){var t=1===e._state?n.onFulfilled:n.onRejected;if(null===t)return void(1===e._state?r:u)(n.promise,e._value);var o;try{o=t(e._value)}catch(i){return void u(n.promise,i)}r(n.promise,o)}))}function r(e,n){try{if(n===e)throw new TypeError("A promise cannot be resolved with itself.");if(n&&("object"==typeof n||"function"==typeof n)){var i=n.then;if(n instanceof o)return e._state=3,e._value=n,void f(e);if("function"==typeof i)return void s(t(i,n),e)}e._state=1,e._value=n,f(e)}catch(r){u(e,r)}}function u(e,n){e._state=2,e._value=n,f(e)}function f(e){2===e._state&&0===e._deferreds.length&&o._immediateFn(function(){e._handled||o._unhandledRejectionFn(e._value)});for(var n=0,t=e._deferreds.length;n<t;n++)i(e,e._deferreds[n]);e._deferreds=null}function c(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}function s(e,n){var t=!1;try{e(function(e){t||(t=!0,r(n,e))},function(e){t||(t=!0,u(n,e))})}catch(o){if(t)return;t=!0,u(n,o)}}var a=setTimeout;o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,t){var o=new this.constructor(n);return i(this,new c(e,t,o)),o},o.all=function(e){var n=Array.prototype.slice.call(e);return new o(function(e,t){function o(r,u){try{if(u&&("object"==typeof u||"function"==typeof u)){var f=u.then;if("function"==typeof f)return void f.call(u,function(e){o(r,e)},t)}n[r]=u,0===--i&&e(n)}catch(c){t(c)}}if(0===n.length)return e([]);for(var i=n.length,r=0;r<n.length;r++)o(r,n[r])})},o.resolve=function(e){return e&&"object"==typeof e&&e.constructor===o?e:new o(function(n){n(e)})},o.reject=function(e){return new o(function(n,t){t(e)})},o.race=function(e){return new o(function(n,t){for(var o=0,i=e.length;o<i;o++)e[o].then(n,t)})},o._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},o._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)},o._setImmediateFn=function(e){o._immediateFn=e},o._setUnhandledRejectionFn=function(e){o._unhandledRejectionFn=e},"undefined"!=typeof module&&module.exports?module.exports=o:e.Promise||(e.Promise=o)}(this);

},{}],6:[function(require,module,exports){
/**
 * Created by danielabrao on 1/17/17.
 */
(function () {
    "use strict";

    module.exports = function () {
        var elementList = {
            "titleText": "Watson Conversation",
            "htmlBody": "",
            "loginWrapper": "",
            "nameLoginInput": "",
            "emailLoginInput": "",
            "widgetEl": "",
            "chatHeader": "",
            "chatWrapper": "",
            "chatEl": "",
            "feedbackEl": "",
            "chatFooter": "",
            "sendBtn": "",
            "sendBtnIcon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNzUnIGhlaWdodD0nOTgnIHZpZXdCb3g9JzAgMCA3NSA5OCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48dGl0bGU+U2VuZDwvdGl0bGU+PGcgZmlsbC1ydWxlPSdub256ZXJvJyBmaWxsPScjRkZGJz48cGF0aCBkPSdNMjYuOCA0Ni44bC0xLjEgMS4xLTIuOSAyLjlMMjYgNTRsMi45LTIuOSAzLjQtMy40IDIuNC0yLjQuOS0uOC0yLjktMi45LTYuNi02LjctMy4zIDMuMyA0IDRIMTV2NC41bDIuMS4xaDkuN3pNNjYuNyAxLjJoLTM2Yy00IDAtNy4yIDMuMi03LjIgNy4ydjEyLjdoMTkuOWM2LjkgMCAxMi41IDUuNiAxMi41IDEyLjV2NC4zbDcuOCA3LjhjLjUuNSAxLjIuOCAxLjkuOHMxLjQtLjMgMS45LS43Yy41LS41LjktMS4yLjktMnYtNi40YzMuMy0uNyA1LjgtMy42IDUuOC03LjFWOC40Yy0uMi00LTMuNS03LjItNy41LTcuMnptMCA1MC4zSDU1Ljh2My45YzAgNi45LTUuNiAxMi41LTEyLjUgMTIuNUgyMy40djEyLjdjMCA0IDMuMiA3LjIgNy4yIDcuMmgyNC43bDguMiA4LjJjLjUuNSAxLjIuOCAxLjkuOHMxLjQtLjMgMS45LS43Yy41LS41LjktMS4yLjktMnYtNi40YzMuMy0uNyA1LjgtMy42IDUuOC03LjFWNTguN2MwLTQtMy4zLTcuMi03LjMtNy4yeicgc3Ryb2tlPScjMDAwJy8+PHBhdGggZD0nTTUuOCA2Mi41djYuNGMwIC43LjMgMS41LjkgMiAuNS41IDEuMi43IDEuOS43czEuNC0uMyAxLjktLjhsOC4yLTguMmgyNC43YzQgMCA3LjItMy4yIDcuMi03LjJWMzMuNmMwLTQtMy4yLTcuMi03LjItNy4yaC0zNmMtNCAwLTcuMiAzLjItNy4yIDcuMnYyMS44Yy0uMiAzLjUgMi4zIDYuNCA1LjYgNy4xem0tLjctMjguOWMwLTEuMiAxLTIuMiAyLjItMi4yaDM2YzEuMiAwIDIuMiAxIDIuMiAyLjJ2MjEuOGMwIDEuMi0xIDIuMi0yLjIgMi4ySDE2LjVsLTUuNyA1Ljd2LTUuN0g3LjJjLTEuMiAwLTIuMi0xLTIuMi0yLjJWMzMuNmguMXonLz48L2c+PC9zdmc+",
            "inputWrapper": "",
            "inputEl": "",
            "loadingIcon": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTQzLjkzNSAyNS4xNDVjMC0xMC4zMTgtOC4zNjQtMTguNjgzLTE4LjY4My0xOC42ODMtMTAuMzE4IDAtMTguNjgzIDguMzY1LTE4LjY4MyAxOC42ODNoNC4wNjhjMC04LjA3MSA2LjU0My0xNC42MTUgMTQuNjE1LTE0LjYxNXMxNC42MTUgNi41NDMgMTQuNjE1IDE0LjYxNWg0LjA2OHoiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZVR5cGU9InhtbCIgYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgMjUgMjUiIHRvPSIzNjAgMjUgMjUiIGR1cj0iMC42cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PC9zdmc+",
            "headerLogo": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZmlsbD0iIzVBQUFGQSIgZD0iTTguNCAyMC44Yy0uMSAwLS4zIDAtLjQtLjFsLTQuMi0yLjRjLS41LS4zLS42LS45LS40LTEuMy4yLS40LjgtLjYgMS4yLS4zbDQuMiAyLjRjLjQuMi42LjguMyAxLjItLjEuMy0uNC41LS43LjV6bTcuNi03LjNjLjQtLjIuNi0uOC4zLTEuMmwtMi40LTQuMmMtLjItLjQtLjgtLjYtMS4yLS4zLS40LjItLjYuOC0uMyAxLjJsMi40IDQuMmMuMi4zLjUuNC44LjQuMSAwIC4zLS4xLjQtLjF6bTEwLjItMy40VjUuMmMwLS41LS40LS45LS45LS45cy0uOS40LS45LjlWMTBjMCAuNS40LjkuOS45LjUuMS45LS4zLjktLjh6bTkuNyAzbDIuNC00LjJjLjItLjQuMS0xLS4zLTEuMi0uNC0uMi0xLS4xLTEuMi4zbC0yLjQgNC4yYy0uMi40LS4xIDEgLjMgMS4yLjEuMS4zLjEuNC4xLjQuMS43LS4xLjgtLjR6bTYuOSA3LjVsNC4yLTIuNGMuNC0uMi42LS44LjMtMS4yLS4yLS40LS44LS42LTEuMi0uM2wtNC4yIDIuNGMtLjQuMi0uNi44LS4zIDEuMi4yLjMuNS40LjguNC4xLjEuMyAwIC40LS4xem0tMTYuNy02LjNjLTEuNiAwLTMuNC40LTQuNS43LS4xIDAtLjIuMS0uMi4ycy4xLjIuMi4yLjMtLjEuNS0uMWMuOS0uMSAxLjQtLjIgMi43LS4yIDEuNSAwIDIuOS4zIDQuNC44LTUuOCAyLjEtMTEuNSAxMC0xMy40IDE3LjEtMi4xLTIuMy0zLjQtNC45LTMuNC03LjQgMC00LjEgMy40LTYuNiA4LjMtNi42aC40Yy4xIDAgLjEtLjEuMS0uMnMtLjEtLjEtLjItLjJjLS4zLS4xLTEuMS0uMS0xLjktLjEtNC45IDAtOC41IDIuNS04LjUgNy4xIDAgMy4xIDEuOCA2LjUgNC43IDkuNC0uMiAxLS4zIDItLjMgMi45IDAgLjQgMCAxLjEuMiAxLjktMS43LTEuNS0zLTMuMy0zLjctNS4yLS4xLS40LS40LTEuMS0uNS0xLjMgMC0uMS0uMS0uMi0uMi0uMnMtLjIuMS0uMi4yIDAgLjQuMS41YzEgNS4yIDYuMiAxMS44IDE0LjYgMTEuOCA5LjQgMCAxNS44LTcuNyAxNS44LTE1LjguMS04LjQtNi4zLTE1LjUtMTUtMTUuNXptLS44IDI5LjRjLTMgMC01LjYtMS4xLTYuNy0xLjctMS41LS44LTEuOS0yLjItMS45LTQuMSAwLS41IDAtMS4xLjEtMS42IDMuNyAzLjEgOC43IDUuMyAxMy42IDUuMyAxLjEgMCAyLjEtLjIgMy0uNC0xLjUgMS4yLTQuNSAyLjUtOC4xIDIuNXptNS4xLTMuOGMtNC43IDAtOS43LTIuMy0xMy4yLTUuNSAxLjgtOC4yIDkuMi0xNy4zIDEzLjktMTcuMy41IDAgMSAuMSAxLjYuNS45LjYgMS44IDEuMyAyLjUgMiAyLjIgMi4xIDQuMiA1LjcgNC4yIDEwLjEgMCAzLjQtMS4yIDYuMS0yLjQgNy43LTEuNCAxLjgtMy45IDIuNS02LjYgMi41eiIvPjwvc3ZnPg==",
            "upIcon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCA0MiA0MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VXA8L3RpdGxlPjxnIHRyYW5zZm9ybT0icm90YXRlKDkwIDIwIDIxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMS4yODIgOC40NjIpIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiMwMDAiPjxyZWN0IHRyYW5zZm9ybT0ic2NhbGUoLTEgMSkgcm90YXRlKDQ1IDAgLTkuNzg4KSIgeD0iLTEuMjgyIiB5PSI1LjM4NSIgd2lkdGg9IjE2LjQwOCIgaGVpZ2h0PSIzLjA3NyIgcng9IjEuNTM4Ii8+PHJlY3QgdHJhbnNmb3JtPSJzY2FsZSgtMSAxKSByb3RhdGUoLTQ1IDAgMzMuMzc4KSIgeD0iLTEuMjgyIiB5PSIxNS4xMjgiIHdpZHRoPSIxNi40MDgiIGhlaWdodD0iMy4wNzciIHJ4PSIxLjUzOCIvPjwvZz48L2c+PC9zdmc+",
            "downIcon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCA0MiA0MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RG93bjwvdGl0bGU+PGcgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDIxIDIwKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMS4yODIgOC40NjIpIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiMwMDAiPjxyZWN0IHRyYW5zZm9ybT0ic2NhbGUoLTEgMSkgcm90YXRlKDQ1IDAgLTkuNzg4KSIgeD0iLTEuMjgyIiB5PSI1LjM4NSIgd2lkdGg9IjE2LjQwOCIgaGVpZ2h0PSIzLjA3NyIgcng9IjEuNTM4Ii8+PHJlY3QgdHJhbnNmb3JtPSJzY2FsZSgtMSAxKSByb3RhdGUoLTQ1IDAgMzMuMzc4KSIgeD0iLTEuMjgyIiB5PSIxNS4xMjgiIHdpZHRoPSIxNi40MDgiIGhlaWdodD0iMy4wNzciIHJ4PSIxLjUzOCIvPjwvZz48L2c+PC9zdmc+",
            "checkmarkIcon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCA0MiA0MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q2hlY2ttYXJrPC90aXRsZT48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxIDEpIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDcuNjkyIDExLjc5NSkiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iIzAwMCI+PHJlY3QgdHJhbnNmb3JtPSJyb3RhdGUoNDUgNS41MTIgMTIuNTM3KSIgeD0iLS41MTMiIHk9IjEwLjk5OSIgd2lkdGg9IjEyLjA0OSIgaGVpZ2h0PSIzLjA3NyIgcng9IjEuNTM4Ii8+PHJlY3QgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDE1LjM5NCA5LjAwMSkiIHg9IjQuMzY4IiB5PSI3LjQ2MyIgd2lkdGg9IjIyLjA1MSIgaGVpZ2h0PSIzLjA3NyIgcng9IjEuNTM4Ii8+PC9nPjwvZz48L3N2Zz4=",
            "cancelIcon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCA0MiA0MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q2FuY2VsPC90aXRsZT48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxIDEpIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxyZWN0IHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLjc3IDExLjI4MikiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iIzAwMCI+PHJlY3QgdHJhbnNmb3JtPSJzY2FsZSgxIC0xKSByb3RhdGUoLTQ1IC0xMi40MzUgMCkiIHg9Ii0xLjUzOCIgeT0iNy4xNzkiIHdpZHRoPSIyMS41MzgiIGhlaWdodD0iMy41OSIgcng9IjEuNzk1Ii8+PHJlY3QgdHJhbnNmb3JtPSJzY2FsZSgtMSAxKSByb3RhdGUoNDUgMCAtMTMuMzEpIiB4PSItMS41MzgiIHk9IjcuMTc5IiB3aWR0aD0iMjEuNTM4IiBoZWlnaHQ9IjMuNTkiIHJ4PSIxLjc5NSIvPjwvZz48L2c+PC9zdmc+",
            "conversationLogo": "data:image/png;base64,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",
            "discoveryLogo": "data:image/png;base64,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",
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

},{}],7:[function(require,module,exports){
/**
 * Created by danielabrao on 1/16/17.
 */
(function () {
    "use strict";

    module.exports = function (window) {

        if (!window.Promise) {
            window.Promise = require("../dependencies/promise.polyfill.script");
        }

        var conversationContext = {};
        var urls = {
            "feedback": "",
            "conversation": "",
            "extraOptions": ""
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
                                    var response;
                                    try {
                                        response = JSON.parse(xhttp.responseText);
                                    } catch (e) {
                                        response = xhttp.responseText;
                                    }
                                    if (response.context) {
                                        conversationContext = response.context;
                                    }
                                    console.log(conversationContext);
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
            "getExtraOptions": function (query) {
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

                        xhttp.open("POST", urls.extraOptions, true);
                        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
                        xhttp.send(["query=", query].join(""));

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
                        xhttp.send(["option=", option, "&feedback=", JSON.stringify(feedbackObj), "&context=", JSON.stringify(conversationContext)].join(""));
                        console.log(["option=", option, "&feedback=", JSON.stringify(feedbackObj), "&context=", conversationContext].join(""));

                    } else {
                        reject("AJAX Calls not supported on this browser");
                    }
                });
            },
            "saveLogin": function (info) {
                window.sessionStorage.setItem("info", JSON.stringify(info));
            },
            "getLogin": function () {
                try {
                    return JSON.parse(window.sessionStorage.getItem("info"));
                } catch(e) {
                    return null;
                }

            }
        };
    };


}());

},{"../dependencies/promise.polyfill.script":5}],8:[function(require,module,exports){
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

            (function injectCSS (cssFiles)  {
                var headAnchor = window.document.querySelector("head"),
                    self = this;

                if (cssFiles && Array.isArray(cssFiles)) {
                    cssFiles.forEach(function (filePath) {
                        var linksEls = window.document.querySelectorAll("link"),
                            link = window.document.createElement("link");
                        link.href = filePath;
                        link.rel = "stylesheet";

                        for (var i = 0; i < linksEls.length; i += 1) {
                            if (linksEls[i].href.indexOf("widget.style") > -1) {
                                return false;
                            }
                        }
                        headAnchor.appendChild(link);
                    });
                } else {
                    //IMPROVE
                    throw new Error("Value is not CSS Array");
                }
            }(["./js/conversation_widget/dist/css/widget.style.min.css"]));

            appLanguage = (window.navigator.languages && window.navigator.languages[0]) || // Chrome / Firefox
                window.navigator.language ||   // All browsers
                window.navigator.userLanguage;


            return {
                "init": function (configs) {
                    appPhrases = require("./model/internationalization.script")(configs.widgetLanguage || appLanguage);
                    factory = require("./factory/factory.script")(window);
                    controller = require("./controller/controller.script")(window, factory, appPhrases);

                    if (!configs.baseURL) {
                        throw new Error("Can not proceed without a valid URL");
                    }

                    if (!configs.parentContainer) {
                        throw new Error("Can not proceed without a valid node parent element");
                    }

                    if (configs.enableFeedback) {
                        if (!configs.feedbackEndpoint) {
                            throw new Error("You must provide a feedback endpoint whenever enableFeedback is true");
                        } else {
                            factory.setUrl(configs.feedbackEndpoint, "feedback");
                        }
                    }

                    factory.setUrl(configs.baseURL, "conversation");
                    factory.setUrl(configs.extraOptionsEndpoint || "/getExtraOptions?module=hr_module", "extraOptions");
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
},{"./controller/controller.script":2,"./factory/factory.script":7,"./model/internationalization.script":9}],9:[function(require,module,exports){
/**
 * Created by danielabrao on 1/18/17.
 */
(function () {
    "use strict";

    var languages = {
        "pt": {
            "chat": {
                "watsonWelcome": "Olá {user} como posso ajudá-lo?",
                "watsonNegative": "Infelizmente não entendi. Tente perguntar com outras palavras",
                "watsonError": "Um erro ocorreu",
                "watsonFeedback": "Obrigado pelo feedback"
            },
            "elements": {
                "feedbackDisclaimer": "Isso ajudou?",
                "feedbackYesBtn": "Sim",
                "feedbackNoBtn": "Não",
                "nameInputLabel": "Nome completo:",
                "emailInputLabel": "Email válido:",
                "loginButton": "Login",
                "inputPlaceholder": "Escreva sua mensagem...",
                "extraOptionFeedback": "Funcionou?",
                "extraOptionsNegativeFeedback": "Nenhuma das anteriores"
            },
            "error": {
                "invalidLoginFields": "Erro inesperado",
                "emptyLoginFields": "Campos obrigatórios não preenchidos"
            }
        },
        "en": {
            "chat": {
                "watsonWelcome": "Hello {user} how can I help you?",
                "watsonNegative": "I did not understood. Try with another words",
                "watsonError": "An error occurred",
                "watsonFeedback": "Thanks for the feedback"
            },
            "elements": {
                "feedbackDisclaimer": "Did it help?",
                "feedbackYesBtn": "Yes",
                "feedbackNoBtn": "No",
                "nameInputLabel": "Full name:",
                "emailInputLabel": "Valid email:",
                "loginButton": "Login",
                "inputPlaceholder": "Type your message...",
                "extraOptionFeedback": "It worked?",
                "extraOptionsNegativeFeedback": "None of the above"
            },
            "error": {
                "invalidLoginFields": "Unknown error",
                "emptyLoginFields": "Missing required fields"
            }
        },
        "es": {
            "chat": {
                "watsonWelcome": "",
                "watsonNegative": "",
                "watsonError": "",
                "watsonFeedback": ""
            },
            "elements": {
                "feedbackDisclaimer": "",
                "feedbackYesBtn": "",
                "feedbackNoBtn": "",
                "nameInputLabel": "",
                "emailInputLabel": "",
                "loginButton": "Login",
                "inputPlaceholder": "",
                "extraOptionFeedback": "",
                "extraOptionsNegativeFeedback": "None of the above"
            },
            "error": {
                "invalidLoginFields": "Error in login fields",
                "emptyLoginFields": "Missing required fields"
            }
        }
    };

    module.exports = function (countryCode) {
        return languages[countryCode] || languages.en;
    };
}());
},{}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JpY2FyZG9naWwvcmljYXJkby9pYm0vcHJvanMvQ0lPL2dpdC9jb252ZXJzYXRpb25fd2lkZ2V0L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9yaWNhcmRvZ2lsL3JpY2FyZG8vaWJtL3Byb2pzL0NJTy9naXQvY29udmVyc2F0aW9uX3dpZGdldC9qcy9jb250cm9sbGVyL2NoYXRCdWlsZGVyLnNjcmlwdC5qcyIsIi9ob21lL3JpY2FyZG9naWwvcmljYXJkby9pYm0vcHJvanMvQ0lPL2dpdC9jb252ZXJzYXRpb25fd2lkZ2V0L2pzL2NvbnRyb2xsZXIvY29udHJvbGxlci5zY3JpcHQuanMiLCIvaG9tZS9yaWNhcmRvZ2lsL3JpY2FyZG8vaWJtL3Byb2pzL0NJTy9naXQvY29udmVyc2F0aW9uX3dpZGdldC9qcy9jb250cm9sbGVyL2R5bmFtaWNJbnB1dC5zY3JpcHQuanMiLCIvaG9tZS9yaWNhcmRvZ2lsL3JpY2FyZG8vaWJtL3Byb2pzL0NJTy9naXQvY29udmVyc2F0aW9uX3dpZGdldC9qcy9jb250cm9sbGVyL2xvZ2luLnNjcmlwdC5qcyIsIi9ob21lL3JpY2FyZG9naWwvcmljYXJkby9pYm0vcHJvanMvQ0lPL2dpdC9jb252ZXJzYXRpb25fd2lkZ2V0L2pzL2RlcGVuZGVuY2llcy9wcm9taXNlLnBvbHlmaWxsLnNjcmlwdC5qcyIsIi9ob21lL3JpY2FyZG9naWwvcmljYXJkby9pYm0vcHJvanMvQ0lPL2dpdC9jb252ZXJzYXRpb25fd2lkZ2V0L2pzL2VsZW1lbnRzL2VsZW1lbnRzLnNjcmlwdC5qcyIsIi9ob21lL3JpY2FyZG9naWwvcmljYXJkby9pYm0vcHJvanMvQ0lPL2dpdC9jb252ZXJzYXRpb25fd2lkZ2V0L2pzL2ZhY3RvcnkvZmFjdG9yeS5zY3JpcHQuanMiLCIvaG9tZS9yaWNhcmRvZ2lsL3JpY2FyZG8vaWJtL3Byb2pzL0NJTy9naXQvY29udmVyc2F0aW9uX3dpZGdldC9qcy9tYWluLnNjcmlwdC5qcyIsIi9ob21lL3JpY2FyZG9naWwvcmljYXJkby9pYm0vcHJvanMvQ0lPL2dpdC9jb252ZXJzYXRpb25fd2lkZ2V0L2pzL21vZGVsL2ludGVybmF0aW9uYWxpemF0aW9uLnNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgZGFuaWVsYWJyYW8gb24gMS8xNy8xNy5cbiAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsZW1lbnRzLCBmYWN0b3J5LCBhcHBQaHJhc2VzLCBkb2N1bWVudCkge1xuXG5cbiAgICAgICAgdmFyIGR5bmFtaWNJbnB1dCA9IHJlcXVpcmUoXCIuL2R5bmFtaWNJbnB1dC5zY3JpcHRcIikoZG9jdW1lbnQpO1xuICAgICAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgICAgICBcImVuYWJsZUZlZWRiYWNrXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJuZWdhdGl2ZUNvdW50ZXJcIjogMCxcbiAgICAgICAgICAgIFwiY2hhdEhpc3RvcnlcIjogW10sXG4gICAgICAgICAgICBcImV4dHJhT3B0aW9uc1wiOiBbXSxcbiAgICAgICAgICAgIFwibGFzdFF1ZXN0aW9uXCI6IFwiXCJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICBcdFx0XCJzZW5kV2VsY29tZU1zZ1wiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVzZXJPYmplY3QgPSBmYWN0b3J5LmdldExvZ2luKCksXG4gICAgICAgICAgICAgICAgICAgIHVzZXIsXG4gICAgICAgICAgICAgICAgICAgIHdlbGNvbWVNc2cgPSBhcHBQaHJhc2VzLmNoYXQud2F0c29uV2VsY29tZTtcblxuICAgICAgICAgICAgICAgIGlmICh1c2VyT2JqZWN0ICYmIHVzZXJPYmplY3QubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB1c2VyID0gdXNlck9iamVjdC5uYW1lO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXIgPSBcIlVzZXJcIjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtZXRob2RzLnNlbmRRdWVzdGlvbihcImhlbGxvXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gYnVpbGRlci5idWlsZENoYXRCdWJibGUod2VsY29tZU1zZy5yZXBsYWNlKC9cXHt1c2VyXFx9LywgdXNlci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHVzZXIuc3Vic3RyaW5nKDEpKSwgXCJ3YXRzb25cIik7XG4gICAgICAgICAgICB9LFx0XG4gICAgICAgIFx0XHRcbiAgICAgICAgXHQvKlx0XG4gICAgICAgICAgICBcInNlbmRXZWxjb21lTXNnXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdXNlck9iamVjdCA9IGZhY3RvcnkuZ2V0TG9naW4oKSxcbiAgICAgICAgICAgICAgICAgICAgdXNlcixcbiAgICAgICAgICAgICAgICAgICAgd2VsY29tZU1zZyA9IGFwcFBocmFzZXMuY2hhdC53YXRzb25XZWxjb21lO1xuXG4gICAgICAgICAgICAgICAgaWYgKHVzZXJPYmplY3QgJiYgdXNlck9iamVjdC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXIgPSB1c2VyT2JqZWN0Lm5hbWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlciA9IFwiVXNlclwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1aWxkZXIuYnVpbGRDaGF0QnViYmxlKHdlbGNvbWVNc2cucmVwbGFjZSgvXFx7dXNlclxcfS8sIHVzZXIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB1c2VyLnN1YnN0cmluZygxKSksIFwid2F0c29uXCIpO1xuICAgICAgICAgICAgfSwqL1xuICAgICAgICAgICAgXCJjbGVhclJhd0lucHV0XCI6IGZ1bmN0aW9uICh1c2VyVGV4dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1c2VyVGV4dC5yZXBsYWNlKC88W14+XSo+L2csIFwiXCIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2VuZFF1ZXN0aW9uXCI6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kcy5ibG9ja1VJKCkuc2hvd0xvYWQoKS5zZXRMYXN0UXVlc3Rpb24odGV4dCk7XG4gICAgICAgICAgICAgICAgZmFjdG9yeS5tYWtlUXVlc3Rpb24odGV4dCkudGhlbihmdW5jdGlvbiBzdWNjZXNzQ0IoYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbnN3ZXIuaGFzT3duUHJvcGVydHkoXCJvdXRwdXRcIikgJiYgYW5zd2VyLm91dHB1dC50ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlci5idWlsZENoYXRCdWJibGUoYW5zd2VyLm91dHB1dC50ZXh0WzBdLCBcIndhdHNvblwiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuc3dlci5pbnRlbnRzLmxlbmd0aCB8fCBhbnN3ZXIuZW50aXRpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BzLmVuYWJsZUZlZWRiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMudG9nZ2xlRmVlZGJhY2tPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZGVyLmJ1aWxkQ2hhdEJ1YmJsZShhcHBQaHJhc2VzLmNoYXQud2F0c29uTmVnYXRpdmUsIFwid2F0c29uXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gZXJyb3JDQihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIuYnVpbGRDaGF0QnViYmxlKGFwcFBocmFzZXMuY2hhdC53YXRzb25FcnJvciwgXCJ3YXRzb25cIik7XG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucmVsZWFzZVVJKCkuaGlkZUxvYWQoKS5zY3JvbGxDaGF0VG9Cb3R0b20oKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0RXh0cmFPcHRpb25zXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMubmVnYXRpdmVDb3VudGVyIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLmJsb2NrVUkoKS5zaG93TG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICBmYWN0b3J5LmdldEV4dHJhT3B0aW9ucyhwcm9wcy5sYXN0UXVlc3Rpb24pLnRoZW4oZnVuY3Rpb24gc3VjY2Vzc0NCIChleHRyYU9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRyYU9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnNldEV4dHJhT3B0aW9ucyhleHRyYU9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIuY3JlYXRlRXh0cmFPcHRpb25zKHByb3BzLmV4dHJhT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm5lZ2F0aXZlQ291bnRlciArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiBlcnJvckNCIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMuc2VuZEZlZWRiYWNrKFwibmVnYXRpdmVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2VyXCI6IGZhY3RvcnkuZ2V0TG9naW4oKSB8fCBcImFub255bW91c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2hhdEhpc3RvcnlcIjogcHJvcHMuY2hhdEhpc3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJlcnJvclwiOiBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMudG9nZ2xlRmVlZGJhY2tPcHRpb25zKCkucmVsZWFzZVVJKCkuaGlkZUxvYWQoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnNlbmRGZWVkYmFjayhcIm5lZ2F0aXZlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVzZXJcIjogZmFjdG9yeS5nZXRMb2dpbigpIHx8IFwiYW5vbnltb3VzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNoYXRIaXN0b3J5XCI6IHByb3BzLmNoYXRIaXN0b3J5XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRvZ2dsZUZlZWRiYWNrT3B0aW9uc1wiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwiZmVlZGJhY2tFbFwiKS5jbGFzc0xpc3QudG9nZ2xlKFwic2hvdy1mZWVkYmFja1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNlbmRGZWVkYmFja1wiOiBmdW5jdGlvbiAob3B0aW9uLCBwYXlsb2FkKSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kcy5ibG9ja1VJKCkuc2hvd0xvYWQoKTtcbiAgICAgICAgICAgICAgICBmYWN0b3J5LnNlbmRGZWVkYmFjayhvcHRpb24sIHBheWxvYWQpLnRoZW4oZnVuY3Rpb24gc3VjY2Vzc0NCKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gZXJyb3JDQihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIuYnVpbGRDaGF0QnViYmxlKGFwcFBocmFzZXMuY2hhdC53YXRzb25GZWVkYmFjaywgXCJ3YXRzb25cIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50cy5nZXQoXCJmZWVkYmFja0VsXCIpLmNsYXNzTGlzdC5jb250YWlucyhcInNob3ctZmVlZGJhY2tcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMudG9nZ2xlRmVlZGJhY2tPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5yZWxlYXNlVUkoKS5oaWRlTG9hZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzY3JvbGxDaGF0VG9Cb3R0b21cIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLmdldChcImNoYXRXcmFwcGVyXCIpLnNjcm9sbFRvcCA9IGVsZW1lbnRzLmdldChcImNoYXRXcmFwcGVyXCIpLnNjcm9sbEhlaWdodDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNob3dMb2FkXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJidXR0b25JY29uSG9sZGVyXCIpLnNyYyA9IGVsZW1lbnRzLmdldChcImxvYWRpbmdJY29uXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiaGlkZUxvYWRcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLmdldChcImJ1dHRvbkljb25Ib2xkZXJcIikuc3JjID0gZWxlbWVudHMuZ2V0KFwic2VuZEJ0bkljb25cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ1cGRhdGVJbnB1dFN0eWxlXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dElucHV0ID0gZWxlbWVudHMuZ2V0KFwiaW5wdXRFbFwiKTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dElucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHRJbnB1dC5zdHlsZS5ib3JkZXJCb3R0b20gPSBcIjNweCBzb2xpZCBibGFja1wiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHRJbnB1dC5zdHlsZS5ib3JkZXJCb3R0b20gPSBcIjBcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJjbGVhbklucHV0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJpbnB1dEVsXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImlucHV0Rm9jdXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLmdldChcImlucHV0RWxcIikuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImFwcGVuZE1zZ1RvSGlzdG9yeVwiOiBmdW5jdGlvbiAobXNnT2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1zZ09iaikge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jaGF0SGlzdG9yeS5wdXNoKG1zZ09iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2V0RXh0cmFPcHRpb25zXCI6IGZ1bmN0aW9uIChleHRyYU9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5leHRyYU9wdGlvbnMgPSBleHRyYU9wdGlvbnMgfHwgW107XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRMYXN0UXVlc3Rpb25cIjogZnVuY3Rpb24gKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMubGFzdFF1ZXN0aW9uID0gcXVlc3Rpb24gfHwgXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImJsb2NrVUlcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLmdldChcImlucHV0V3JhcHBlclwiKS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwic2VuZEJ0blwiKS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwiaW5wdXRFbFwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInJlbGVhc2VVSVwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwiaW5wdXRXcmFwcGVyXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJzZW5kQnRuXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJpbnB1dEVsXCIpLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBidWlsZGVyID0ge1xuICAgICAgICAgICAgXCJidWlsZEN1c3RvbVByb3BlcnRpZXNcIjogZnVuY3Rpb24gKHdpZGdldENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5lbmFibGVGZWVkYmFjayA9IHdpZGdldENvbmZpZ3MuZW5hYmxlRmVlZGJhY2s7XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkZ2V0Q29uZmlncy5oYXNPd25Qcm9wZXJ0eShcImN1c3RvbVRpdGxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3aWRnZXRDb25maWdzLmN1c3RvbVRpdGxlICYmIHR5cGVvZiB3aWRnZXRDb25maWdzLmN1c3RvbVRpdGxlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5zZXQoXCJ0aXRsZVRleHRcIiwgd2lkZ2V0Q29uZmlncy5jdXN0b21UaXRsZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjdXN0b21UaXRsZSBtdXN0IGJlIGEgdmFsaWQgdGV4dCBwcm9wZXJ0eVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aWRnZXRDb25maWdzLmN1c3RvbUxvZ28pIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuc2V0KFwiaGVhZGVyTG9nb1wiLCB3aWRnZXRDb25maWdzLmN1c3RvbUxvZ28pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJhdHRhY2hMaXN0ZW5lclwiOiBmdW5jdGlvbiAobGlzdGVuZXIsIGVsLCBjYikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIobGlzdGVuZXIsIGNiKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEhUTUwgRWxlbWVudFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJhdHRhY2hLZXlMaXN0ZW5lclwiOiBmdW5jdGlvbiAoZWwsIGNiLCBzZWNvbmRDQikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kQ0IoKTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImNyZWF0ZVdpZGdldEhlYWRlclwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoZWFkZXJcIiksXG4gICAgICAgICAgICAgICAgICAgIGxvZ29JbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcblxuICAgICAgICAgICAgICAgIGxvZ29JbWcuc2V0QXR0cmlidXRlKFwiYWx0XCIsIFwiQ3VzdG9tIGxvZ29cIik7XG4gICAgICAgICAgICAgICAgbG9nb0ltZy5zcmMgPSBlbGVtZW50cy5nZXQoXCJoZWFkZXJMb2dvXCIpO1xuICAgICAgICAgICAgICAgIGxvZ29JbWcub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nb0ltZy5zcmMgPSBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvNDh4NDhcIjtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGhlYWRlclRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGVsZW1lbnRzLmdldChcInRpdGxlVGV4dFwiKSkpO1xuXG4gICAgICAgICAgICAgICAgaGVhZGVyLmFwcGVuZENoaWxkKGxvZ29JbWcpO1xuICAgICAgICAgICAgICAgIGhlYWRlci5hcHBlbmRDaGlsZChoZWFkZXJUaXRsZSk7XG4gICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoXCJ3aWRnZXQtaGVhZGVyXCIpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImNyZWF0ZVdpZGdldEJvZHlcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjaGF0V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgICAgIGNoYXRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICAgICAgICAgICAgICBjaGF0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwid2lkZ2V0LWJvZHlcIik7XG4gICAgICAgICAgICAgICAgY2hhdEVsLmNsYXNzTGlzdC5hZGQoXCJ3aWRnZXQtY2hhdFwiKTtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNldChcImNoYXRXcmFwcGVyXCIsIGNoYXRXcmFwcGVyKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5zZXQoXCJjaGF0RWxcIiwgY2hhdEVsKTtcblxuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5lbmFibGVGZWVkYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmVlZGJhY2tEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXNjbGFpbWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aXZlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lZ2F0aXZlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcblxuICAgICAgICAgICAgICAgICAgICBidWlsZGVyLmF0dGFjaExpc3RlbmVyKFwiY2xpY2tcIiwgcG9zaXRpdmVCdG4sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMuc2VuZEZlZWRiYWNrKFwicG9zaXRpdmVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2VyXCI6IGZhY3RvcnkuZ2V0TG9naW4oKSB8fCBcImFub255bW91c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2hhdEhpc3RvcnlcIjogcHJvcHMuY2hhdEhpc3RvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMubmVnYXRpdmVDb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnVpbGRlci5hdHRhY2hMaXN0ZW5lcihcImNsaWNrXCIsIG5lZ2F0aXZlQnRuLCBtZXRob2RzLmdldEV4dHJhT3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXYuY2xhc3NMaXN0LmFkZChcImZlZWRiYWNrLXNlc3Npb25cIik7XG5cbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXNjbGFpbWVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcFBocmFzZXMuZWxlbWVudHMuZmVlZGJhY2tEaXNjbGFpbWVyKSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aXZlQnRuLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcFBocmFzZXMuZWxlbWVudHMuZmVlZGJhY2tZZXNCdG4pKTtcbiAgICAgICAgICAgICAgICAgICAgbmVnYXRpdmVCdG4uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwUGhyYXNlcy5lbGVtZW50cy5mZWVkYmFja05vQnRuKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXYuYXBwZW5kQ2hpbGQoZmVlZGJhY2tEaXNjbGFpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uQm94LmFwcGVuZENoaWxkKHBvc2l0aXZlQnRuKTtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uQm94LmFwcGVuZENoaWxkKG5lZ2F0aXZlQnRuKTtcbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tEaXYuYXBwZW5kQ2hpbGQoYnV0dG9uQm94KTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5zZXQoXCJmZWVkYmFja0VsXCIsIGZlZWRiYWNrRGl2KTtcblxuICAgICAgICAgICAgICAgICAgICBjaGF0RWwuYXBwZW5kQ2hpbGQoZmVlZGJhY2tEaXYpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNoYXRXcmFwcGVyLmFwcGVuZENoaWxkKGNoYXRFbCk7XG4gICAgICAgICAgICAgICAgLy9tZXRob2RzLnNlbmRXZWxjb21lTXNnKGZhY3RvcnkuZ2V0TG9naW4oKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYXRXcmFwcGVyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiYnVpbGRDaGF0QnViYmxlXCI6IGZ1bmN0aW9uICh0ZXh0SW5wdXQsIHNlbmRlcikge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICBpZiAoIXRleHRJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dElucHV0ID0gbWV0aG9kcy5jbGVhclJhd0lucHV0KHRleHRJbnB1dCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG1zZ1dyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICBtc2dCdWJibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblxuICAgICAgICAgICAgICAgIG1zZ1dyYXBwZXIuY2xhc3NMaXN0LmFkZChcIm1zZy13cmFwcGVyXCIpO1xuICAgICAgICAgICAgICAgIG1zZ0J1YmJsZS5jbGFzc0xpc3QuYWRkKFwiY2hhdC1idWJibGVcIik7XG4gICAgICAgICAgICAgICAgbXNnQnViYmxlLmlubmVySFRNTCA9IHRleHRJbnB1dDtcblxuICAgICAgICAgICAgICAgIGlmIChzZW5kZXIgPT09IFwid2F0c29uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnV3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibGVmdFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtc2dXcmFwcGVyLmNsYXNzTGlzdC5hZGQoXCJyaWdodFwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtc2dXcmFwcGVyLmFwcGVuZENoaWxkKG1zZ0J1YmJsZSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwiY2hhdEVsXCIpLmFwcGVuZENoaWxkKG1zZ1dyYXBwZXIpO1xuICAgICAgICAgICAgICAgIG1ldGhvZHMuc2Nyb2xsQ2hhdFRvQm90dG9tKCkuYXBwZW5kTXNnVG9IaXN0b3J5KHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0ZXh0XCI6IHRleHRJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgXCJzb3VyY2VcIjogc2VuZGVyIHx8IFwidXNlclwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJjcmVhdGVFeHRyYU9wdGlvbnNcIjogZnVuY3Rpb24gKG9wdGlvbnNBcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkob3B0aW9uc0FycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9uc0Fyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1ldGhvZHMuYmxvY2tVSSgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG91dGVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICBvdXRlckRpdi5jbGFzc0xpc3QuYWRkKFwiZXh0cmEtb3B0aW9ucy1jb250YWluZXJcIik7XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zQXJyLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbikge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vREVDTEFSQVRJT05TXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb25XcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbkRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25DYW5vbmljYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbkV4cGFuc2libGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uQW5zd2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbkZlZWRiYWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZlZWRiYWNrVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRBbnN3ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG93ZXJlZEJ5TG9nbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9TRVRVUFNcbiAgICAgICAgICAgICAgICAgICAgLy8gc3VwcG9ydEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZWxlbWVudHMuZ2V0KFwiZG93bkljb25cIikpO1xuICAgICAgICAgICAgICAgICAgICBmZWVkYmFja0ltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZWxlbWVudHMuZ2V0KFwiY2hlY2ttYXJrSWNvblwiKSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbldyYXBwZXIuY2xhc3NMaXN0LmFkZChcInNsaWRlXCIpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25EaXYuY2xhc3NMaXN0LmFkZChcImV4dHJhLW9wdGlvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uRGl2LmNsYXNzTGlzdC5hZGQob3B0aW9uLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbkNhbm9uaWNhbC5jbGFzc0xpc3QuYWRkKFwiY2Fub25pY2FsLXF1ZXN0aW9uXCIpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25FeHBhbnNpYmxlLmNsYXNzTGlzdC5hZGQoXCJleHBhbnNpYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25FeHBhbnNpYmxlLmNsYXNzTGlzdC5hZGQoXCJvcHRpb24tYm94XCIpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25BbnN3ZXIuY2xhc3NMaXN0LmFkZChcIm9wdGlvbi10ZXh0XCIpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25GZWVkYmFjay5jbGFzc0xpc3QuYWRkKFwib3B0aW9uLWZlZWRiYWNrXCIpO1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlZEFuc3dlci5jbGFzc0xpc3QuYWRkKFwiZmVhdHVyZWQtYW5zd2VyXCIpO1xuICAgICAgICAgICAgICAgICAgICBzdXBwb3J0QnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJpY29uXCIpO1xuICAgICAgICAgICAgICAgICAgICBwb3dlcmVkQnlMb2dvLnNldEF0dHJpYnV0ZShcInNyY1wiLCBlbGVtZW50cy5nZXQob3B0aW9uLnNvdXJjZSArIFwiTG9nb1wiKSk7XG4gICAgICAgICAgICAgICAgICAgIHBvd2VyZWRCeUxvZ28uc2V0QXR0cmlidXRlKFwiYWx0XCIsIG9wdGlvbi5zb3VyY2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIuYXR0YWNoTGlzdGVuZXIoXCJjbGlja1wiLCBvcHRpb25EaXYsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25FeHBhbnNpYmxlLmNsYXNzTGlzdC50b2dnbGUoXCJleHBhbnNpYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uRXhwYW5zaWJsZS5jbGFzc0xpc3QudG9nZ2xlKFwiY2xvc2FibGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdXBwb3J0QnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoXCJ1cFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYnVpbGRlci5hdHRhY2hMaXN0ZW5lcihcImNsaWNrXCIsIG9wdGlvbkZlZWRiYWNrLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJjaGF0RWxcIikucmVtb3ZlQ2hpbGQob3V0ZXJEaXYpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzLmFwcGVuZE1zZ1RvSGlzdG9yeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0ZXh0XCI6IG9wdGlvbi5hbnN3ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzb3VyY2VcIjogXCJleHRyYU9wdGlvbnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMuc2VuZEZlZWRiYWNrKFwicG9zaXRpdmVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2VyXCI6IGZhY3RvcnkuZ2V0TG9naW4oKSB8fCBcImFub255bW91c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2hhdEhpc3RvcnlcIjogcHJvcHMuY2hhdEhpc3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJleHRyYU9wdGlvbnNcIjogb3B0aW9uc0FyclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMuc2V0RXh0cmFPcHRpb25zKCkucmVsZWFzZVVJKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vQVBQRU5EXG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uQ2Fub25pY2FsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG9wdGlvbi5jYW5vbmljYWwpKTtcblxuICAgICAgICAgICAgICAgICAgICBvcHRpb25EaXYuYXBwZW5kQ2hpbGQocG93ZXJlZEJ5TG9nbyk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbkRpdi5hcHBlbmRDaGlsZChvcHRpb25DYW5vbmljYWwpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25EaXYuYXBwZW5kQ2hpbGQoc3VwcG9ydEJ1dHRvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uQW5zd2VyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG9wdGlvbi5hbnN3ZXIpKTtcblxuICAgICAgICAgICAgICAgICAgICBmZWVkYmFja1RleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwUGhyYXNlcy5lbGVtZW50cy5leHRyYU9wdGlvbkZlZWRiYWNrKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uRmVlZGJhY2suYXBwZW5kQ2hpbGQoZmVlZGJhY2tUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uRmVlZGJhY2suYXBwZW5kQ2hpbGQoZmVlZGJhY2tJbWcpO1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbkV4cGFuc2libGUuYXBwZW5kQ2hpbGQob3B0aW9uQW5zd2VyKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uRXhwYW5zaWJsZS5hcHBlbmRDaGlsZChvcHRpb25GZWVkYmFjayk7XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uV3JhcHBlci5hcHBlbmRDaGlsZChvcHRpb25EaXYpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25XcmFwcGVyLmFwcGVuZENoaWxkKG9wdGlvbkV4cGFuc2libGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIG91dGVyRGl2LmFwcGVuZENoaWxkKG9wdGlvbldyYXBwZXIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5lZ2F0aXZlRmVlZGJhY2tXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgbmVnYXRpdmVGZWVkYmFja0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgICAgIG5lZ2F0aXZlRmVlZGJhY2tUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIiksXG4gICAgICAgICAgICAgICAgICAgIG5lZ2F0aXZlRmVlZGJhY2tJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICAgICAgICAgIG5lZ2F0aXZlRmVlZGJhY2tXcmFwcGVyLmNsYXNzTGlzdC5hZGQoXCJuZWdhdGl2ZS1mZWVkYmFjay13cmFwcGVyXCIpO1xuICAgICAgICAgICAgICAgIG5lZ2F0aXZlRmVlZGJhY2tEaXYuY2xhc3NMaXN0LmFkZChcIm9wdGlvbi1mZWVkYmFja1wiKTtcblxuICAgICAgICAgICAgICAgIG5lZ2F0aXZlRmVlZGJhY2tJbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIGVsZW1lbnRzLmdldChcImNhbmNlbEljb25cIikpO1xuXG4gICAgICAgICAgICAgICAgbmVnYXRpdmVGZWVkYmFja1RleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwUGhyYXNlcy5lbGVtZW50cy5leHRyYU9wdGlvbnNOZWdhdGl2ZUZlZWRiYWNrKSk7XG4gICAgICAgICAgICAgICAgbmVnYXRpdmVGZWVkYmFja0Rpdi5hcHBlbmRDaGlsZChuZWdhdGl2ZUZlZWRiYWNrVGV4dCk7XG4gICAgICAgICAgICAgICAgbmVnYXRpdmVGZWVkYmFja0Rpdi5hcHBlbmRDaGlsZChuZWdhdGl2ZUZlZWRiYWNrSW1nKTtcblxuICAgICAgICAgICAgICAgIGJ1aWxkZXIuYXR0YWNoTGlzdGVuZXIoXCJjbGlja1wiLCBuZWdhdGl2ZUZlZWRiYWNrRGl2LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLmdldChcImNoYXRFbFwiKS5yZW1vdmVDaGlsZChvdXRlckRpdik7XG5cbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5zZW5kRmVlZGJhY2soXCJuZWdhdGl2ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwieFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2VyXCI6IGZhY3RvcnkuZ2V0TG9naW4oKSB8fCBcImFub255bW91c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjaGF0SGlzdG9yeVwiOiBwcm9wcy5jaGF0SGlzdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZXh0cmFPcHRpb25zXCI6IG9wdGlvbnNBcnJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5zZXRFeHRyYU9wdGlvbnMoKS5yZWxlYXNlVUkoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgbmVnYXRpdmVGZWVkYmFja1dyYXBwZXIuYXBwZW5kQ2hpbGQobmVnYXRpdmVGZWVkYmFja0Rpdik7XG5cbiAgICAgICAgICAgICAgICBvdXRlckRpdi5hcHBlbmRDaGlsZChuZWdhdGl2ZUZlZWRiYWNrV3JhcHBlcik7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50cy5nZXQoXCJjaGF0RWxcIikuYXBwZW5kQ2hpbGQob3V0ZXJEaXYpO1xuICAgICAgICAgICAgICAgIG1ldGhvZHMuc2Nyb2xsQ2hhdFRvQm90dG9tKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJjcmVhdGVXaWRnZXRGb290ZXJcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIiksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiksXG4gICAgICAgICAgICAgICAgICAgIHRleHRJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKSxcbiAgICAgICAgICAgICAgICAgICAgc2VuZEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiksXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbkljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGJ1dHRvbkxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dElucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZGVyLmJ1aWxkQ2hhdEJ1YmJsZSh0ZXh0SW5wdXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5zZW5kUXVlc3Rpb24odGV4dElucHV0LnZhbHVlKS5jbGVhbklucHV0KCkudXBkYXRlSW5wdXRTdHlsZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGR5bmFtaWNJbnB1dCh7XG4gICAgICAgICAgICAgICAgICAgIFwiaGFuZGxlclwiOiB0ZXh0SW5wdXQsXG4gICAgICAgICAgICAgICAgICAgIFwibWluV2lkdGhcIjogMjUsXG4gICAgICAgICAgICAgICAgICAgIFwicGFyZW50XCI6IGlucHV0V3JhcHBlclxuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICBmb290ZXIuY2xhc3NMaXN0LmFkZChcIndpZGdldC1mb290ZXJcIik7XG4gICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoXCJpbnB1dC13cmFwcGVyXCIpO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRMYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgXCJ3aWRnZXQtaW5wdXRcIik7XG4gICAgICAgICAgICAgICAgaW5wdXRMYWJlbC5pbm5lckhUTUwgPSBhcHBQaHJhc2VzLmVsZW1lbnRzLmlucHV0UGxhY2Vob2xkZXI7XG4gICAgICAgICAgICAgICAgdGV4dElucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0XCIpO1xuICAgICAgICAgICAgICAgIHRleHRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcIndpZGdldC1pbnB1dFwiKTtcblxuICAgICAgICAgICAgICAgIGJ1aWxkZXIuYXR0YWNoTGlzdGVuZXIoXCJmb2N1c1wiLCB0ZXh0SW5wdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRMYWJlbC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYnVpbGRlci5hdHRhY2hMaXN0ZW5lcihcImJsdXJcIiwgdGV4dElucHV0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGV4dElucHV0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dExhYmVsLmlubmVySFRNTCA9IGFwcFBocmFzZXMuZWxlbWVudHMuaW5wdXRQbGFjZWhvbGRlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5hdHRhY2hMaXN0ZW5lcihcImNsaWNrXCIsIGlucHV0V3JhcHBlciwgbWV0aG9kcy5pbnB1dEZvY3VzKTtcbiAgICAgICAgICAgICAgICBzZWxmLmF0dGFjaExpc3RlbmVyKFwiY2xpY2tcIiwgc2VuZEJ1dHRvbiwgYnV0dG9uTGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIHNlbGYuYXR0YWNoS2V5TGlzdGVuZXIodGV4dElucHV0LCBidXR0b25MaXN0ZW5lciwgbWV0aG9kcy51cGRhdGVJbnB1dFN0eWxlKTtcblxuICAgICAgICAgICAgICAgIGJ1dHRvbkljb24uc3JjID0gZWxlbWVudHMuZ2V0KFwic2VuZEJ0bkljb25cIik7XG5cbiAgICAgICAgICAgICAgICBzZW5kQnV0dG9uLmFwcGVuZENoaWxkKGJ1dHRvbkljb24pO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyLmFwcGVuZENoaWxkKGlucHV0TGFiZWwpO1xuICAgICAgICAgICAgICAgIGlucHV0V3JhcHBlci5hcHBlbmRDaGlsZCh0ZXh0SW5wdXQpO1xuXG4gICAgICAgICAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKGlucHV0V3JhcHBlcik7XG4gICAgICAgICAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKHNlbmRCdXR0b24pO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudHMuc2V0KFwiaW5wdXRXcmFwcGVyXCIsIGlucHV0TGFiZWwpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNldChcImlucHV0RWxcIiwgdGV4dElucHV0KTtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5zZXQoXCJzZW5kQnRuXCIsIHNlbmRCdXR0b24pO1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNldChcImJ1dHRvbkljb25Ib2xkZXJcIiwgYnV0dG9uSWNvbik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZm9vdGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJjcmVhdGVXaWRnZXRcIjogZnVuY3Rpb24gKHdpZGdldENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIHdpZGdldEVsLmNsYXNzTGlzdC5hZGQoXCJjb252ZXJzYXRpb24td2lkZ2V0XCIpO1xuXG4gICAgICAgICAgICAgICAgYnVpbGRlci5idWlsZEN1c3RvbVByb3BlcnRpZXMod2lkZ2V0Q29uZmlncyk7XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkZ2V0Q29uZmlncy5pbmNsdWRlSGVhZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZGdldEVsLmFwcGVuZENoaWxkKGJ1aWxkZXIuY3JlYXRlV2lkZ2V0SGVhZGVyKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdpZGdldEVsLmFwcGVuZENoaWxkKGJ1aWxkZXIuY3JlYXRlV2lkZ2V0Qm9keSgpKTtcbiAgICAgICAgICAgICAgICB3aWRnZXRFbC5hcHBlbmRDaGlsZChidWlsZGVyLmNyZWF0ZVdpZGdldEZvb3RlcigpKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtZXRob2RzLnNlbmRXZWxjb21lTXNnKGZhY3RvcnkuZ2V0TG9naW4oKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldEVsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG59KCkpO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGRhbmllbGFicmFvIG9uIDEvMTYvMTcuXG4gKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh3aW5kb3csIGZhY3RvcnksIGFwcFBocmFzZXMpIHtcblxuXG4gICAgICAgIHZhciBzZWxmID0ge1xuICAgICAgICAgICAgXCJtZXRob2RzXCI6IHtcbiAgICAgICAgICAgICAgICBcImFwcGVuZFRvQm94XCI6IGZ1bmN0aW9uIChwYXJlbnRDb250YWluZXIsIHdpZGdldCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyZW50Q29udGFpbmVyKS5hcHBlbmRDaGlsZCh3aWRnZXQpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhcmVudCBjb250YWluZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiY3JlYXRlV2lkZ2V0SW5zdGFuY2VcIjogZnVuY3Rpb24gKHdpZGdldENvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSByZXF1aXJlKFwiLi4vZWxlbWVudHMvZWxlbWVudHMuc2NyaXB0XCIpKCksXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXIgPSByZXF1aXJlKFwiLi9jaGF0QnVpbGRlci5zY3JpcHRcIikoZWxlbWVudHMsIGZhY3RvcnksIGFwcFBocmFzZXMsIHdpbmRvdy5kb2N1bWVudCksXG4gICAgICAgICAgICAgICAgICAgIGxvZ2luRW5naW5lID0gcmVxdWlyZShcIi4vbG9naW4uc2NyaXB0XCIpKGVsZW1lbnRzLCBmYWN0b3J5LCBhcHBQaHJhc2VzLCB3aW5kb3cuZG9jdW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICB3aWRnZXQsXG4gICAgICAgICAgICAgICAgICAgIGJvZHlFbDtcblxuICAgICAgICAgICAgICAgIGlmICh3aWRnZXRDb25maWdzLnBhcmVudENvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAod2lkZ2V0Q29uZmlncy5lbmFibGVMb2dpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW5FbmdpbmUuaW5pdCh3aWRnZXRDb25maWdzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQgPSBidWlsZGVyLmNyZWF0ZVdpZGdldCh3aWRnZXRDb25maWdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm1ldGhvZHMuYXBwZW5kVG9Cb3god2lkZ2V0Q29uZmlncy5wYXJlbnRDb250YWluZXIsIHdpZGdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0ID0gYnVpbGRlci5jcmVhdGVXaWRnZXQod2lkZ2V0Q29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm1ldGhvZHMuYXBwZW5kVG9Cb3god2lkZ2V0Q29uZmlncy5wYXJlbnRDb250YWluZXIsIHdpZGdldCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm9keUVsID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG5cblxufSgpKTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgZGFuaWVsYWJyYW8gb24gMS8yMy8xNy5cbiAqL1xuLypcbiAqIEB2ZXJzaW9uOiAwLjFcbiAqIEBhdXRob3I6IEd1aWxoZXJtZSBIZW5yaXF1ZSBPa2EgTWFycXVlc1xuICovXG4oZnVuY3Rpb24oKXtcblxuICAgIHZhciBkb2N1bWVudCA9IGRvY3VtZW50IHx8IFwiXCI7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgY3JlYXRlRHVtbXkgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc2VzLCBwYXJlbnQpe1xuICAgICAgICB2YXIgdGFyZ2V0ID0gcGFyZW50LFxuICAgICAgICAgICAgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicHJlXCIpO1xuICAgICAgICBkdW1teS5jbGFzc05hbWUgPSBjbGFzc2VzO1xuICAgICAgICBkdW1teS5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgICAgZHVtbXkuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICAgICAgZHVtbXkuc3R5bGUubGVmdCA9IFwiMHB4XCI7XG4gICAgICAgIGR1bW15LnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgIGR1bW15LnN0eWxlLm1heFdpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgIGR1bW15LnN0eWxlLnpJbmRleCA9IFwiLTFcIjtcbiAgICAgICAgZHVtbXkuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgICAgICBkdW1teS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgZHVtbXkuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgICAgICBkdW1teS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGR1bW15KTtcbiAgICAgICAgcmV0dXJuIGR1bW15O1xuICAgIH07XG4gICAgdmFyIHVwZGF0ZVNpemUgPSBmdW5jdGlvbihlbGVtZW50LCBkdW1teSwgbWluV2lkdGgpe1xuICAgICAgICBkdW1teS50ZXh0Q29udGVudCA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUud2lkdGggPSBNYXRoLm1heChtaW5XaWR0aCwgZHVtbXkub2Zmc2V0V2lkdGgpICsgXCJweFwiO1xuICAgIH07XG4gICAgdmFyIHJlc2V0U2l6ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIGR1bW15LCBtaW5XaWR0aCl7XG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLndpZHRoID0gbWluV2lkdGggKyBcInB4XCI7XG4gICAgICAgIGR1bW15LnRleHRDb250ZW50ID0gXCJcIjtcbiAgICB9O1xuICAgIHZhciBhcHBseSA9IGZ1bmN0aW9uKGNvbmZpZyl7XG5cbiAgICAgICAgdmFyIGR1bW15ID0gY3JlYXRlRHVtbXkoY29uZmlnLmhhbmRsZXIsIGNvbmZpZy5jbGFzc2VzLCBjb25maWcucGFyZW50KTtcbiAgICAgICAgY29uZmlnLmhhbmRsZXIub25pbnB1dCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgdXBkYXRlU2l6ZSh0aGlzLCBkdW1teSwgY29uZmlnLm1pbldpZHRoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVzZXRTaXplKGNvbmZpZy5oYW5kbGVyLCBkdW1teSwgY29uZmlnLm1pbldpZHRoKTtcbiAgICB9O1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9jdW1lbnRPYmope1xuICAgICAgICBkb2N1bWVudCA9IGRvY3VtZW50T2JqO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHNldHVwKSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHkoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6IHNldHVwLmhhbmRsZXIsXG4gICAgICAgICAgICAgICAgbWluV2lkdGg6IHNldHVwLm1pbldpZHRoIHx8IDEwLFxuICAgICAgICAgICAgICAgIGNsYXNzZXM6IChzZXR1cC5jbGFzc2VzIHx8IFwiXCIpICsgXCIgZHluYW1pY0lucHV0RHVtbXlcIixcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IHNldHVwLnBhcmVudCB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuXG4gICAgfTtcbn0pKCk7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGRhbmllbGFicmFvIG9uIDEvMjMvMTcuXG4gKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtZW50cywgZmFjdG9yeSwgYXBwUGhyYXNlcywgZG9jdW1lbnQpIHtcblxuICAgICAgICB2YXIgcGFyZW50RWxlbWVudDtcblxuICAgICAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICAgICAgICAgIFwiYWRkUmVsYXRpdmVQb3NpdGlvblRvUGFyZW50XCI6IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQuc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBidWlsZGVyID0ge1xuICAgICAgICAgICAgXCJidWlsZENvcHlyaWdodERpc2NsYWltZXJcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwiY29weXJpZ2h0LWRpc2NsYWltZXJcIik7XG4gICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFtuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCksIFwiSUJNXCJdLmpvaW4oXCIgXCIpKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImJ1aWxkTWFpbkltYWdlXCI6IGZ1bmN0aW9uIChjdXN0b21Mb2dvKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuXG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IGN1c3RvbUxvZ28gfHwgZWxlbWVudHMuZ2V0KFwiaGVhZGVyTG9nb1wiKTtcbiAgICAgICAgICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGltZyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImJ1aWxkSW5wdXRGaWVsZFwiOiBmdW5jdGlvbiAobmFtZSwgdHlwZSwgcmVxdWlyZWQsIGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiksXG4gICAgICAgICAgICAgICAgICAgIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoXCJsb2dpbi1pbnB1dC13cmFwcGVyXCIpO1xuXG4gICAgICAgICAgICAgICAgaW5wdXRMYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgbmFtZSk7XG4gICAgICAgICAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCB0eXBlKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsIG5hbWUpO1xuICAgICAgICAgICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIG5hbWUpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNldChbbmFtZSwgXCJMb2dpbklucHV0XCJdLmpvaW4oXCJcIiksIGlucHV0KTtcblxuICAgICAgICAgICAgICAgIGlucHV0TGFiZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGFiZWwpKTtcbiAgICAgICAgICAgICAgICBpbnB1dFdyYXBwZXIuYXBwZW5kQ2hpbGQoaW5wdXRMYWJlbCk7XG4gICAgICAgICAgICAgICAgaW5wdXRXcmFwcGVyLmFwcGVuZENoaWxkKGlucHV0KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dFdyYXBwZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJidWlsZFNlbmRCdXR0b25cIjogZnVuY3Rpb24gKGJ1dHRvblRleHQsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuXG4gICAgICAgICAgICAgICAgYnRuLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGJ1dHRvblRleHQpKTtcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gZWxlbWVudHMuZ2V0KFwibmFtZUxvZ2luSW5wdXRcIikudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWwgPSBlbGVtZW50cy5nZXQoXCJlbWFpbExvZ2luSW5wdXRcIikudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChhcHBQaHJhc2VzLmVycm9yLmludmFsaWRMb2dpbkZpZWxkcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5hbWUgfHwgIWVtYWlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGFwcFBocmFzZXMuZXJyb3IuZW1wdHlMb2dpbkZpZWxkcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBmYWN0b3J5LnNhdmVMb2dpbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZW1haWxcIjogZW1haWxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMuZ2V0KFwibG9naW5XcmFwcGVyXCIpLnN0eWxlLnpJbmRleCA9IC0xO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShcImxvZ2dlZFwiKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidG47XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJidWlsZExvZ2luTGF5ZXJcIjogZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCwgd2lkZ2V0Q29uZmlncykge1xuICAgICAgICAgICAgICAgIHZhciBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgbGF5ZXIuY2xhc3NMaXN0LmFkZChcImxvZ2luLWxheWVyXCIpO1xuXG5cbiAgICAgICAgICAgICAgICB2YXIgaW1nRGl2ID0gYnVpbGRlci5idWlsZE1haW5JbWFnZSh3aWRnZXRDb25maWdzLmN1c3RvbUxvZ28pO1xuXG4gICAgICAgICAgICAgICAgbGF5ZXIuYXBwZW5kQ2hpbGQoaW1nRGl2KTtcblxuICAgICAgICAgICAgICAgIHZhciBsb2dpbkJvZHlEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIGxvZ2luQm9keURpdi5jbGFzc0xpc3QuYWRkKFwibG9naW4tYm9keVwiKTtcbiAgICAgICAgICAgICAgICBsb2dpbkJvZHlEaXYuYXBwZW5kQ2hpbGQoYnVpbGRlci5idWlsZElucHV0RmllbGQoXCJuYW1lXCIsIFwidGV4dFwiLCB0cnVlLCBhcHBQaHJhc2VzLmVsZW1lbnRzLm5hbWVJbnB1dExhYmVsKSk7XG4gICAgICAgICAgICAgICAgbG9naW5Cb2R5RGl2LmFwcGVuZENoaWxkKGJ1aWxkZXIuYnVpbGRJbnB1dEZpZWxkKFwiZW1haWxcIiwgXCJlbWFpbFwiLCB0cnVlLCBhcHBQaHJhc2VzLmVsZW1lbnRzLmVtYWlsSW5wdXRMYWJlbCkpO1xuICAgICAgICAgICAgICAgIGxvZ2luQm9keURpdi5hcHBlbmRDaGlsZChidWlsZGVyLmJ1aWxkU2VuZEJ1dHRvbihhcHBQaHJhc2VzLmVsZW1lbnRzLmxvZ2luQnV0dG9uLCByZXNvbHZlKSk7XG4gICAgICAgICAgICAgICAgbGF5ZXIuYXBwZW5kQ2hpbGQobG9naW5Cb2R5RGl2KTtcbiAgICAgICAgICAgICAgICBsYXllci5hcHBlbmRDaGlsZChidWlsZGVyLmJ1aWxkQ29weXJpZ2h0RGlzY2xhaW1lcigpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJpbml0XCI6IGZ1bmN0aW9uICh3aWRnZXRDb25maWdzKXtcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih3aWRnZXRDb25maWdzLnBhcmVudENvbnRhaW5lcik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmFjdG9yeS5nZXRMb2dpbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKFwiYWxyZWFkeSBsb2dnZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGF5ZXIgPSBidWlsZGVyLmJ1aWxkTG9naW5MYXllcihyZXNvbHZlLCByZWplY3QsIHdpZGdldENvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5hZGRSZWxhdGl2ZVBvc2l0aW9uVG9QYXJlbnQocGFyZW50RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50cy5zZXQoXCJsb2dpbldyYXBwZXJcIiwgbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgfTtcblxuXG59KCkpOyIsIi8qKlxuICogQ3JlYXRlZCBieSBkYW5pZWxhYnJhbyBvbiAyLzE0LzE3LlxuICovXG4hZnVuY3Rpb24oZSl7ZnVuY3Rpb24gbigpe31mdW5jdGlvbiB0KGUsbil7cmV0dXJuIGZ1bmN0aW9uKCl7ZS5hcHBseShuLGFyZ3VtZW50cyl9fWZ1bmN0aW9uIG8oZSl7aWYoXCJvYmplY3RcIiE9dHlwZW9mIHRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ld1wiKTtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlKXRocm93IG5ldyBUeXBlRXJyb3IoXCJub3QgYSBmdW5jdGlvblwiKTt0aGlzLl9zdGF0ZT0wLHRoaXMuX2hhbmRsZWQ9ITEsdGhpcy5fdmFsdWU9dm9pZCAwLHRoaXMuX2RlZmVycmVkcz1bXSxzKGUsdGhpcyl9ZnVuY3Rpb24gaShlLG4pe2Zvcig7Mz09PWUuX3N0YXRlOyllPWUuX3ZhbHVlO3JldHVybiAwPT09ZS5fc3RhdGU/dm9pZCBlLl9kZWZlcnJlZHMucHVzaChuKTooZS5faGFuZGxlZD0hMCx2b2lkIG8uX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCl7dmFyIHQ9MT09PWUuX3N0YXRlP24ub25GdWxmaWxsZWQ6bi5vblJlamVjdGVkO2lmKG51bGw9PT10KXJldHVybiB2b2lkKDE9PT1lLl9zdGF0ZT9yOnUpKG4ucHJvbWlzZSxlLl92YWx1ZSk7dmFyIG87dHJ5e289dChlLl92YWx1ZSl9Y2F0Y2goaSl7cmV0dXJuIHZvaWQgdShuLnByb21pc2UsaSl9cihuLnByb21pc2Usbyl9KSl9ZnVuY3Rpb24gcihlLG4pe3RyeXtpZihuPT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi5cIik7aWYobiYmKFwib2JqZWN0XCI9PXR5cGVvZiBufHxcImZ1bmN0aW9uXCI9PXR5cGVvZiBuKSl7dmFyIGk9bi50aGVuO2lmKG4gaW5zdGFuY2VvZiBvKXJldHVybiBlLl9zdGF0ZT0zLGUuX3ZhbHVlPW4sdm9pZCBmKGUpO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGkpcmV0dXJuIHZvaWQgcyh0KGksbiksZSl9ZS5fc3RhdGU9MSxlLl92YWx1ZT1uLGYoZSl9Y2F0Y2gocil7dShlLHIpfX1mdW5jdGlvbiB1KGUsbil7ZS5fc3RhdGU9MixlLl92YWx1ZT1uLGYoZSl9ZnVuY3Rpb24gZihlKXsyPT09ZS5fc3RhdGUmJjA9PT1lLl9kZWZlcnJlZHMubGVuZ3RoJiZvLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpe2UuX2hhbmRsZWR8fG8uX3VuaGFuZGxlZFJlamVjdGlvbkZuKGUuX3ZhbHVlKX0pO2Zvcih2YXIgbj0wLHQ9ZS5fZGVmZXJyZWRzLmxlbmd0aDtuPHQ7bisrKWkoZSxlLl9kZWZlcnJlZHNbbl0pO2UuX2RlZmVycmVkcz1udWxsfWZ1bmN0aW9uIGMoZSxuLHQpe3RoaXMub25GdWxmaWxsZWQ9XCJmdW5jdGlvblwiPT10eXBlb2YgZT9lOm51bGwsdGhpcy5vblJlamVjdGVkPVwiZnVuY3Rpb25cIj09dHlwZW9mIG4/bjpudWxsLHRoaXMucHJvbWlzZT10fWZ1bmN0aW9uIHMoZSxuKXt2YXIgdD0hMTt0cnl7ZShmdW5jdGlvbihlKXt0fHwodD0hMCxyKG4sZSkpfSxmdW5jdGlvbihlKXt0fHwodD0hMCx1KG4sZSkpfSl9Y2F0Y2gobyl7aWYodClyZXR1cm47dD0hMCx1KG4sbyl9fXZhciBhPXNldFRpbWVvdXQ7by5wcm90b3R5cGVbXCJjYXRjaFwiXT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy50aGVuKG51bGwsZSl9LG8ucHJvdG90eXBlLnRoZW49ZnVuY3Rpb24oZSx0KXt2YXIgbz1uZXcgdGhpcy5jb25zdHJ1Y3RvcihuKTtyZXR1cm4gaSh0aGlzLG5ldyBjKGUsdCxvKSksb30sby5hbGw9ZnVuY3Rpb24oZSl7dmFyIG49QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZSk7cmV0dXJuIG5ldyBvKGZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbyhyLHUpe3RyeXtpZih1JiYoXCJvYmplY3RcIj09dHlwZW9mIHV8fFwiZnVuY3Rpb25cIj09dHlwZW9mIHUpKXt2YXIgZj11LnRoZW47aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZilyZXR1cm4gdm9pZCBmLmNhbGwodSxmdW5jdGlvbihlKXtvKHIsZSl9LHQpfW5bcl09dSwwPT09LS1pJiZlKG4pfWNhdGNoKGMpe3QoYyl9fWlmKDA9PT1uLmxlbmd0aClyZXR1cm4gZShbXSk7Zm9yKHZhciBpPW4ubGVuZ3RoLHI9MDtyPG4ubGVuZ3RoO3IrKylvKHIsbltyXSl9KX0sby5yZXNvbHZlPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZcIm9iamVjdFwiPT10eXBlb2YgZSYmZS5jb25zdHJ1Y3Rvcj09PW8/ZTpuZXcgbyhmdW5jdGlvbihuKXtuKGUpfSl9LG8ucmVqZWN0PWZ1bmN0aW9uKGUpe3JldHVybiBuZXcgbyhmdW5jdGlvbihuLHQpe3QoZSl9KX0sby5yYWNlPWZ1bmN0aW9uKGUpe3JldHVybiBuZXcgbyhmdW5jdGlvbihuLHQpe2Zvcih2YXIgbz0wLGk9ZS5sZW5ndGg7bzxpO28rKyllW29dLnRoZW4obix0KX0pfSxvLl9pbW1lZGlhdGVGbj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBzZXRJbW1lZGlhdGUmJmZ1bmN0aW9uKGUpe3NldEltbWVkaWF0ZShlKX18fGZ1bmN0aW9uKGUpe2EoZSwwKX0sby5fdW5oYW5kbGVkUmVqZWN0aW9uRm49ZnVuY3Rpb24oZSl7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGNvbnNvbGUmJmNvbnNvbGUmJmNvbnNvbGUud2FybihcIlBvc3NpYmxlIFVuaGFuZGxlZCBQcm9taXNlIFJlamVjdGlvbjpcIixlKX0sby5fc2V0SW1tZWRpYXRlRm49ZnVuY3Rpb24oZSl7by5faW1tZWRpYXRlRm49ZX0sby5fc2V0VW5oYW5kbGVkUmVqZWN0aW9uRm49ZnVuY3Rpb24oZSl7by5fdW5oYW5kbGVkUmVqZWN0aW9uRm49ZX0sXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9bzplLlByb21pc2V8fChlLlByb21pc2U9byl9KHRoaXMpO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGRhbmllbGFicmFvIG9uIDEvMTcvMTcuXG4gKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRMaXN0ID0ge1xuICAgICAgICAgICAgXCJ0aXRsZVRleHRcIjogXCJXYXRzb24gQ29udmVyc2F0aW9uXCIsXG4gICAgICAgICAgICBcImh0bWxCb2R5XCI6IFwiXCIsXG4gICAgICAgICAgICBcImxvZ2luV3JhcHBlclwiOiBcIlwiLFxuICAgICAgICAgICAgXCJuYW1lTG9naW5JbnB1dFwiOiBcIlwiLFxuICAgICAgICAgICAgXCJlbWFpbExvZ2luSW5wdXRcIjogXCJcIixcbiAgICAgICAgICAgIFwid2lkZ2V0RWxcIjogXCJcIixcbiAgICAgICAgICAgIFwiY2hhdEhlYWRlclwiOiBcIlwiLFxuICAgICAgICAgICAgXCJjaGF0V3JhcHBlclwiOiBcIlwiLFxuICAgICAgICAgICAgXCJjaGF0RWxcIjogXCJcIixcbiAgICAgICAgICAgIFwiZmVlZGJhY2tFbFwiOiBcIlwiLFxuICAgICAgICAgICAgXCJjaGF0Rm9vdGVyXCI6IFwiXCIsXG4gICAgICAgICAgICBcInNlbmRCdG5cIjogXCJcIixcbiAgICAgICAgICAgIFwic2VuZEJ0bkljb25cIjogXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUIzYVdSMGFEMG5OelVuSUdobGFXZG9kRDBuT1RnbklIWnBaWGRDYjNnOUp6QWdNQ0EzTlNBNU9DY2dlRzFzYm5NOUoyaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6SXdNREF2YzNabkp6NDhkR2wwYkdVK1UyVnVaRHd2ZEdsMGJHVStQR2NnWm1sc2JDMXlkV3hsUFNkdWIyNTZaWEp2SnlCbWFXeHNQU2NqUmtaR0p6NDhjR0YwYUNCa1BTZE5Nall1T0NBME5pNDRiQzB4TGpFZ01TNHhMVEl1T1NBeUxqbE1NallnTlRSc01pNDVMVEl1T1NBekxqUXRNeTQwSURJdU5DMHlMalF1T1MwdU9DMHlMamt0TWk0NUxUWXVOaTAyTGpjdE15NHpJRE11TXlBMElEUklNVFYyTkM0MWJESXVNUzR4YURrdU4zcE5Oall1TnlBeExqSm9MVE0yWXkwMElEQXROeTR5SURNdU1pMDNMaklnTnk0eWRqRXlMamRvTVRrdU9XTTJMamtnTUNBeE1pNDFJRFV1TmlBeE1pNDFJREV5TGpWMk5DNHpiRGN1T0NBM0xqaGpMalV1TlNBeExqSXVPQ0F4TGprdU9ITXhMalF0TGpNZ01TNDVMUzQzWXk0MUxTNDFMamt0TVM0eUxqa3RNbll0Tmk0MFl6TXVNeTB1TnlBMUxqZ3RNeTQySURVdU9DMDNMakZXT0M0MFl5MHVNaTAwTFRNdU5TMDNMakl0Tnk0MUxUY3VNbnB0TUNBMU1DNHpTRFUxTGpoMk15NDVZekFnTmk0NUxUVXVOaUF4TWk0MUxURXlMalVnTVRJdU5VZ3lNeTQwZGpFeUxqZGpNQ0EwSURNdU1pQTNMaklnTnk0eUlEY3VNbWd5TkM0M2JEZ3VNaUE0TGpKakxqVXVOU0F4TGpJdU9DQXhMamt1T0hNeExqUXRMak1nTVM0NUxTNDNZeTQxTFM0MUxqa3RNUzR5TGprdE1uWXROaTQwWXpNdU15MHVOeUExTGpndE15NDJJRFV1T0MwM0xqRldOVGd1TjJNd0xUUXRNeTR6TFRjdU1pMDNMak10Tnk0eWVpY2djM1J5YjJ0bFBTY2pNREF3Snk4K1BIQmhkR2dnWkQwblRUVXVPQ0EyTWk0MWRqWXVOR013SUM0M0xqTWdNUzQxTGprZ01pQXVOUzQxSURFdU1pNDNJREV1T1M0M2N6RXVOQzB1TXlBeExqa3RMamhzT0M0eUxUZ3VNbWd5TkM0M1l6UWdNQ0EzTGpJdE15NHlJRGN1TWkwM0xqSldNek11Tm1Nd0xUUXRNeTR5TFRjdU1pMDNMakl0Tnk0eWFDMHpObU10TkNBd0xUY3VNaUF6TGpJdE55NHlJRGN1TW5ZeU1TNDRZeTB1TWlBekxqVWdNaTR6SURZdU5DQTFMallnTnk0eGVtMHRMamN0TWpndU9XTXdMVEV1TWlBeExUSXVNaUF5TGpJdE1pNHlhRE0yWXpFdU1pQXdJREl1TWlBeElESXVNaUF5TGpKMk1qRXVPR013SURFdU1pMHhJREl1TWkweUxqSWdNaTR5U0RFMkxqVnNMVFV1TnlBMUxqZDJMVFV1TjBnM0xqSmpMVEV1TWlBd0xUSXVNaTB4TFRJdU1pMHlMakpXTXpNdU5tZ3VNWG9uTHo0OEwyYytQQzl6ZG1jK1wiLFxuICAgICAgICAgICAgXCJpbnB1dFdyYXBwZXJcIjogXCJcIixcbiAgICAgICAgICAgIFwiaW5wdXRFbFwiOiBcIlwiLFxuICAgICAgICAgICAgXCJsb2FkaW5nSWNvblwiOiBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlIZHBaSFJvUFNJME1DSWdhR1ZwWjJoMFBTSTBNQ0lnZG1sbGQwSnZlRDBpTUNBd0lEVXdJRFV3SWo0OGNHRjBhQ0JtYVd4c1BTSjNhR2wwWlNJZ1pEMGlUVFF6TGprek5TQXlOUzR4TkRWak1DMHhNQzR6TVRndE9DNHpOalF0TVRndU5qZ3pMVEU0TGpZNE15MHhPQzQyT0RNdE1UQXVNekU0SURBdE1UZ3VOamd6SURndU16WTFMVEU0TGpZNE15QXhPQzQyT0ROb05DNHdOamhqTUMwNExqQTNNU0EyTGpVME15MHhOQzQyTVRVZ01UUXVOakUxTFRFMExqWXhOWE14TkM0Mk1UVWdOaTQxTkRNZ01UUXVOakUxSURFMExqWXhOV2cwTGpBMk9Ib2lQanhoYm1sdFlYUmxWSEpoYm5ObWIzSnRJR0YwZEhKcFluVjBaVlI1Y0dVOUluaHRiQ0lnWVhSMGNtbGlkWFJsVG1GdFpUMGlkSEpoYm5ObWIzSnRJaUIwZVhCbFBTSnliM1JoZEdVaUlHWnliMjA5SWpBZ01qVWdNalVpSUhSdlBTSXpOakFnTWpVZ01qVWlJR1IxY2owaU1DNDJjeUlnY21Wd1pXRjBRMjkxYm5ROUltbHVaR1ZtYVc1cGRHVWlMejQ4TDNCaGRHZytQQzl6ZG1jK1wiLFxuICAgICAgICAgICAgXCJoZWFkZXJMb2dvXCI6IFwiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhacFpYZENiM2c5SWpBZ01DQTFNQ0ExTUNJK1BIQmhkR2dnWm1sc2JEMGlJelZCUVVGR1FTSWdaRDBpVFRndU5DQXlNQzQ0WXkwdU1TQXdMUzR6SURBdExqUXRMakZzTFRRdU1pMHlMalJqTFM0MUxTNHpMUzQyTFM0NUxTNDBMVEV1TXk0eUxTNDBMamd0TGpZZ01TNHlMUzR6YkRRdU1pQXlMalJqTGpRdU1pNDJMamd1TXlBeExqSXRMakV1TXkwdU5DNDFMUzQzTGpWNmJUY3VOaTAzTGpOakxqUXRMakl1TmkwdU9DNHpMVEV1TW13dE1pNDBMVFF1TW1NdExqSXRMalF0TGpndExqWXRNUzR5TFM0ekxTNDBMakl0TGpZdU9DMHVNeUF4TGpKc01pNDBJRFF1TW1NdU1pNHpMalV1TkM0NExqUXVNU0F3SUM0ekxTNHhMalF0TGpGNmJURXdMakl0TXk0MFZqVXVNbU13TFM0MUxTNDBMUzQ1TFM0NUxTNDVjeTB1T1M0MExTNDVMamxXTVRCak1DQXVOUzQwTGprdU9TNDVMalV1TVM0NUxTNHpMamt0TGpoNmJUa3VOeUF6YkRJdU5DMDBMakpqTGpJdExqUXVNUzB4TFM0ekxURXVNaTB1TkMwdU1pMHhMUzR4TFRFdU1pNHpiQzB5TGpRZ05DNHlZeTB1TWk0MExTNHhJREVnTGpNZ01TNHlMakV1TVM0ekxqRXVOQzR4TGpRdU1TNDNMUzR4TGpndExqUjZiVFl1T1NBM0xqVnNOQzR5TFRJdU5HTXVOQzB1TWk0MkxTNDRMak10TVM0eUxTNHlMUzQwTFM0NExTNDJMVEV1TWkwdU0yd3ROQzR5SURJdU5HTXRMalF1TWkwdU5pNDRMUzR6SURFdU1pNHlMak11TlM0MExqZ3VOQzR4TGpFdU15QXdJQzQwTFM0eGVtMHRNVFl1TnkwMkxqTmpMVEV1TmlBd0xUTXVOQzQwTFRRdU5TNDNMUzR4SURBdExqSXVNUzB1TWk0eWN5NHhMakl1TWk0eUxqTXRMakV1TlMwdU1XTXVPUzB1TVNBeExqUXRMaklnTWk0M0xTNHlJREV1TlNBd0lESXVPUzR6SURRdU5DNDRMVFV1T0NBeUxqRXRNVEV1TlNBeE1DMHhNeTQwSURFM0xqRXRNaTR4TFRJdU15MHpMalF0TkM0NUxUTXVOQzAzTGpRZ01DMDBMakVnTXk0MExUWXVOaUE0TGpNdE5pNDJhQzQwWXk0eElEQWdMakV0TGpFdU1TMHVNbk10TGpFdExqRXRMakl0TGpKakxTNHpMUzR4TFRFdU1TMHVNUzB4TGprdExqRXROQzQ1SURBdE9DNDFJREl1TlMwNExqVWdOeTR4SURBZ015NHhJREV1T0NBMkxqVWdOQzQzSURrdU5DMHVNaUF4TFM0eklESXRMak1nTWk0NUlEQWdMalFnTUNBeExqRXVNaUF4TGprdE1TNDNMVEV1TlMwekxUTXVNeTB6TGpjdE5TNHlMUzR4TFM0MExTNDBMVEV1TVMwdU5TMHhMak1nTUMwdU1TMHVNUzB1TWkwdU1pMHVNbk10TGpJdU1TMHVNaTR5SURBZ0xqUXVNUzQxWXpFZ05TNHlJRFl1TWlBeE1TNDRJREUwTGpZZ01URXVPQ0E1TGpRZ01DQXhOUzQ0TFRjdU55QXhOUzQ0TFRFMUxqZ3VNUzA0TGpRdE5pNHpMVEUxTGpVdE1UVXRNVFV1TlhwdExTNDRJREk1TGpSakxUTWdNQzAxTGpZdE1TNHhMVFl1TnkweExqY3RNUzQxTFM0NExURXVPUzB5TGpJdE1TNDVMVFF1TVNBd0xTNDFJREF0TVM0eExqRXRNUzQySURNdU55QXpMakVnT0M0M0lEVXVNeUF4TXk0MklEVXVNeUF4TGpFZ01DQXlMakV0TGpJZ015MHVOQzB4TGpVZ01TNHlMVFF1TlNBeUxqVXRPQzR4SURJdU5YcHROUzR4TFRNdU9HTXROQzQzSURBdE9TNDNMVEl1TXkweE15NHlMVFV1TlNBeExqZ3RPQzR5SURrdU1pMHhOeTR6SURFekxqa3RNVGN1TXk0MUlEQWdNU0F1TVNBeExqWXVOUzQ1TGpZZ01TNDRJREV1TXlBeUxqVWdNaUF5TGpJZ01pNHhJRFF1TWlBMUxqY2dOQzR5SURFd0xqRWdNQ0F6TGpRdE1TNHlJRFl1TVMweUxqUWdOeTQzTFRFdU5DQXhMamd0TXk0NUlESXVOUzAyTGpZZ01pNDFlaUl2UGp3dmMzWm5QZz09XCIsXG4gICAgICAgICAgICBcInVwSWNvblwiOiBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjNhV1IwYUQwaU5ESWlJR2hsYVdkb2REMGlORElpSUhacFpYZENiM2c5SWpBZ01DQTBNaUEwTWlJZ2VHMXNibk05SW1oMGRIQTZMeTkzZDNjdWR6TXViM0puTHpJd01EQXZjM1puSWo0OGRHbDBiR1UrVlhBOEwzUnBkR3hsUGp4bklIUnlZVzV6Wm05eWJUMGljbTkwWVhSbEtEa3dJREl3SURJeEtTSWdabWxzYkQwaWJtOXVaU0lnWm1sc2JDMXlkV3hsUFNKbGRtVnViMlJrSWo0OGNtVmpkQ0J6ZEhKdmEyVTlJaU13TURBaUlITjBjbTlyWlMxM2FXUjBhRDBpTWlJZ2QybGtkR2c5SWpRd0lpQm9aV2xuYUhROUlqUXdJaUJ5ZUQwaU1qQWlMejQ4WnlCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3hNUzR5T0RJZ09DNDBOaklwSWlCbWFXeHNMWEoxYkdVOUltNXZibnBsY204aUlHWnBiR3c5SWlNd01EQWlQanh5WldOMElIUnlZVzV6Wm05eWJUMGljMk5oYkdVb0xURWdNU2tnY205MFlYUmxLRFExSURBZ0xUa3VOemc0S1NJZ2VEMGlMVEV1TWpneUlpQjVQU0kxTGpNNE5TSWdkMmxrZEdnOUlqRTJMalF3T0NJZ2FHVnBaMmgwUFNJekxqQTNOeUlnY25nOUlqRXVOVE00SWk4K1BISmxZM1FnZEhKaGJuTm1iM0p0UFNKelkyRnNaU2d0TVNBeEtTQnliM1JoZEdVb0xUUTFJREFnTXpNdU16YzRLU0lnZUQwaUxURXVNamd5SWlCNVBTSXhOUzR4TWpnaUlIZHBaSFJvUFNJeE5pNDBNRGdpSUdobGFXZG9kRDBpTXk0d056Y2lJSEo0UFNJeExqVXpPQ0l2UGp3dlp6NDhMMmMrUEM5emRtYytcIixcbiAgICAgICAgICAgIFwiZG93bkljb25cIjogXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUIzYVdSMGFEMGlORElpSUdobGFXZG9kRDBpTkRJaUlIWnBaWGRDYjNnOUlqQWdNQ0EwTWlBME1pSWdlRzFzYm5NOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6SXdNREF2YzNabklqNDhkR2wwYkdVK1JHOTNiand2ZEdsMGJHVStQR2NnZEhKaGJuTm1iM0p0UFNKeWIzUmhkR1VvTFRrd0lESXhJREl3S1NJZ1ptbHNiRDBpYm05dVpTSWdabWxzYkMxeWRXeGxQU0psZG1WdWIyUmtJajQ4Y21WamRDQnpkSEp2YTJVOUlpTXdNREFpSUhOMGNtOXJaUzEzYVdSMGFEMGlNaUlnZDJsa2RHZzlJalF3SWlCb1pXbG5hSFE5SWpRd0lpQnllRDBpTWpBaUx6NDhaeUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNneE1TNHlPRElnT0M0ME5qSXBJaUJtYVd4c0xYSjFiR1U5SW01dmJucGxjbThpSUdacGJHdzlJaU13TURBaVBqeHlaV04wSUhSeVlXNXpabTl5YlQwaWMyTmhiR1VvTFRFZ01Ta2djbTkwWVhSbEtEUTFJREFnTFRrdU56ZzRLU0lnZUQwaUxURXVNamd5SWlCNVBTSTFMak00TlNJZ2QybGtkR2c5SWpFMkxqUXdPQ0lnYUdWcFoyaDBQU0l6TGpBM055SWdjbmc5SWpFdU5UTTRJaTgrUEhKbFkzUWdkSEpoYm5ObWIzSnRQU0p6WTJGc1pTZ3RNU0F4S1NCeWIzUmhkR1VvTFRRMUlEQWdNek11TXpjNEtTSWdlRDBpTFRFdU1qZ3lJaUI1UFNJeE5TNHhNamdpSUhkcFpIUm9QU0l4Tmk0ME1EZ2lJR2hsYVdkb2REMGlNeTR3TnpjaUlISjRQU0l4TGpVek9DSXZQand2Wno0OEwyYytQQzl6ZG1jK1wiLFxuICAgICAgICAgICAgXCJjaGVja21hcmtJY29uXCI6IFwiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCM2FXUjBhRDBpTkRJaUlHaGxhV2RvZEQwaU5ESWlJSFpwWlhkQ2IzZzlJakFnTUNBME1pQTBNaUlnZUcxc2JuTTlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5Mekl3TURBdmMzWm5JajQ4ZEdsMGJHVStRMmhsWTJ0dFlYSnJQQzkwYVhSc1pUNDhaeUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNneElERXBJaUJtYVd4c1BTSnViMjVsSWlCbWFXeHNMWEoxYkdVOUltVjJaVzV2WkdRaVBqeHlaV04wSUhOMGNtOXJaVDBpSXpBd01DSWdjM1J5YjJ0bExYZHBaSFJvUFNJeUlpQjNhV1IwYUQwaU5EQWlJR2hsYVdkb2REMGlOREFpSUhKNFBTSXlNQ0l2UGp4bklIUnlZVzV6Wm05eWJUMGlkSEpoYm5Oc1lYUmxLRGN1TmpreUlERXhMamM1TlNraUlHWnBiR3d0Y25Wc1pUMGlibTl1ZW1WeWJ5SWdabWxzYkQwaUl6QXdNQ0krUEhKbFkzUWdkSEpoYm5ObWIzSnRQU0p5YjNSaGRHVW9ORFVnTlM0MU1USWdNVEl1TlRNM0tTSWdlRDBpTFM0MU1UTWlJSGs5SWpFd0xqazVPU0lnZDJsa2RHZzlJakV5TGpBME9TSWdhR1ZwWjJoMFBTSXpMakEzTnlJZ2NuZzlJakV1TlRNNElpOCtQSEpsWTNRZ2RISmhibk5tYjNKdFBTSnliM1JoZEdVb01UTTFJREUxTGpNNU5DQTVMakF3TVNraUlIZzlJalF1TXpZNElpQjVQU0kzTGpRMk15SWdkMmxrZEdnOUlqSXlMakExTVNJZ2FHVnBaMmgwUFNJekxqQTNOeUlnY25nOUlqRXVOVE00SWk4K1BDOW5Qand2Wno0OEwzTjJaejQ9XCIsXG4gICAgICAgICAgICBcImNhbmNlbEljb25cIjogXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUIzYVdSMGFEMGlORElpSUdobGFXZG9kRDBpTkRJaUlIWnBaWGRDYjNnOUlqQWdNQ0EwTWlBME1pSWdlRzFzYm5NOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6SXdNREF2YzNabklqNDhkR2wwYkdVK1EyRnVZMlZzUEM5MGFYUnNaVDQ4WnlCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3hJREVwSWlCbWFXeHNQU0p1YjI1bElpQm1hV3hzTFhKMWJHVTlJbVYyWlc1dlpHUWlQanh5WldOMElITjBjbTlyWlQwaUl6QXdNQ0lnYzNSeWIydGxMWGRwWkhSb1BTSXlJaUIzYVdSMGFEMGlOREFpSUdobGFXZG9kRDBpTkRBaUlISjRQU0l5TUNJdlBqeG5JSFJ5WVc1elptOXliVDBpZEhKaGJuTnNZWFJsS0RFd0xqYzNJREV4TGpJNE1pa2lJR1pwYkd3dGNuVnNaVDBpYm05dWVtVnlieUlnWm1sc2JEMGlJekF3TUNJK1BISmxZM1FnZEhKaGJuTm1iM0p0UFNKelkyRnNaU2d4SUMweEtTQnliM1JoZEdVb0xUUTFJQzB4TWk0ME16VWdNQ2tpSUhnOUlpMHhMalV6T0NJZ2VUMGlOeTR4TnpraUlIZHBaSFJvUFNJeU1TNDFNemdpSUdobGFXZG9kRDBpTXk0MU9TSWdjbmc5SWpFdU56azFJaTgrUEhKbFkzUWdkSEpoYm5ObWIzSnRQU0p6WTJGc1pTZ3RNU0F4S1NCeWIzUmhkR1VvTkRVZ01DQXRNVE11TXpFcElpQjRQU0l0TVM0MU16Z2lJSGs5SWpjdU1UYzVJaUIzYVdSMGFEMGlNakV1TlRNNElpQm9aV2xuYUhROUlqTXVOVGtpSUhKNFBTSXhMamM1TlNJdlBqd3ZaejQ4TDJjK1BDOXpkbWMrXCIsXG4gICAgICAgICAgICBcImNvbnZlcnNhdGlvbkxvZ29cIjogXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUZBQUFBQlFDQVlBQUFDT0VmS3RBQUFNUGtsRVFWUjQydTJkZTFCVTF4M0hmZnpqRFAyajFqK2NpVE9TcVUxRG16UVZLazFON0hRU05jWW5LTHUrY1ZGQlkwMU50U05vRkRHbUJsOVJBM3ZCMUFlYU5uRmFGV09qR0UxOGpGVWlpcG9FUmFNb3VzM2RSZEdJeW5PRi9mWDdPOXdydEd6R1BidDdlUGJPZk9mY3ZTejMzdlBoOS91ZGMzN24zRXVuNXQ2c0dVNVdaNHZtN0E2RlkzOHl0TUtxNmRrbzh5R0hKY05aWnRIMEd1elhzWGlmajFrMThiTjhsTm5RQ21neWZoYUJrcy9WR1dXbmRyZE5CRERBQVRTOUsyQ0VvcEpXS0IwZ2NsRnBGNDVWUXg2SUpPV0JhbkR1RXF1R2MyWG82WkFWQ2dWVXZsYW5xRlhYMnk0NGhqWXU2UnBLNTQ4QUt4b1Z5b0t1NHJPYkFhZ1FydVBHZGE4QzRGWnIvVFY3VE5pZ0M2dHZNeHR1WGdpVjZRMVljNkU4VktBS29tWldGWlNINjgrendpckgxb2VPMWcxdWJJWUE5d1RjS0JFcU5HSVl0YkRxb0l0UUVrRDI0amlKc3ZXQWk3RzcyRjBaWUFoS0d3Q2U5UStjZXBDNHQzT0l1M0hRRDZBV3QwaU9iNUNMeTc3UVRnQVVydHFhQlhEVmZLK0FHUTYzYmpscmhJdXl1dUdHNG5GRHhYeHpiVXpGZ0pnQXorbUdzam10N2x1QUUrYmZFOUt3WDRtUzJxTDQzbzA2OUlTVVd5UEhPUWJIWlJpc2JyK0NXTmN5c1pIcmdqcWg1TG9waTNjR1FEMFM1V20rZUx1UkpuUWFpdVRRRlBRUmpUQnZUY1M4L3JoZ0FVVHRVUUIzM3FweEhWSFhZRUVVWnAwaEZBa0plTzFaRmtDRWgwVmludzBtQ0c0TEdmRkJ1RzNIa0g0S0NvTUNjMmRyUTJ1N0g2SU9KVTNmRDB2c0NmbnZ1bEEzYnViTmJFa0hrOGVpb2U1Z0FQbmh1dldCTkFFUy9id09xa3J1YkZzMWlZeE9qUEZsUUF5SHJ2R0pPcml1TVF0dVNNZHF1czlEdEJCb2gvWC84SXcrb21BUkFqM0dkUVU4SjVkeFVIV0hoOWNBc1JxaHpBYVF6T2V4MXRlTFUxSnR1QjhIS1JrM24yRTIwUGVtNEUzclM3SUV2ZFYxbWZMK1dVajNBNVl1Tk1iZW9CaERqWTZaM3d1NFZZYVNqQWJXKzNBTkNrVkZDZ1BvZ0RhR2hvbzRLR3BOSVEzN2N5NE5YbnlBWGs3YVF5OGxadFBBQlh0b2NQSkJIUCtDb3Q2OVNCYjd2L243VXVCTU1OTzJsTkNpWGFWa1AzU1h0cCs4VHgrZmZTQzBQZTgrYVRpMk9MdVVwdU03eHU4RUJCTGdMa0NoVU5QWVoyUWk1dnByZlkxdkxIcmRaWG9sK1RONjhmVk5GRGwxRlVYRXZrWGhrMUtnSlkyVWd1UExLSExhYWhyd2h5MDBKT1V3alY1L3hRVHB0YUk0SnF4ci9BWW5KUVBNM3EvS3FialVUWlUxZGVUeGVPaC9OeHdUUDd0KzIwMDVYNWRUeXU3Yk5BRy9Hd0JJN2h2T05kcUtKdGJYQTE4NDZiL1Z1V2pNZTlkZ2FaL1M4d25yS1dMeVVoT1VLVDVteWp4bWdoWEhmak1qalY1WjhqbkZwRjNuODNsMTF3VTdTdW5ZTjVWVVhsMUhzbHNGWUo2NFVrbHZ3bUw5ZG12TmVSTHFBWm5XSitCeEdTMDllOWJvQmthdS9KSmVuTDNSQkdjQzgxa05JTitDUldiUnFOWG5IMEdNd1hVbXZ1K2tyT05sZEtlOGxnTGQ3bGJVMGdjbjd0R2t2N2o0M0xJQXE1aVZ4Wnljd2dkV0Z5akwzM2pITWU3WDA5OTlERGc1a0d6RncxTlBpeGJWdHNsRm54YVVrN3ZXUThIYUh1SmNuMTJvb0ttYjVTRXlLNERzQWozcXVqd0pJRVdTSnpIaEljNnROTjB3YU1MNUVCL1hrSFhOR1RwMHNaTHFQQUhEOHhvamoxNnF3QjlJRGlMQUZVRlBOZ1pvaGR4eURZYUwzWll0VHdLZW5QcE9US1pCcnkybjgxZHVrS3FOL3pCN3pqMmc4WmxPbVpqSXJLekNoY2RsbG5Ecm15N3J1bWd3T09ZcGdwY2l5dWZHenFlZnZHcWptVXZYMDczeUNtVVFxOXgxdE83QWQ5ekN5M1NzMDZ6MmVndnNEdVhLdXU3Z1Jmdk5tS1hNK3NKR3pxQ25odG9vYk1SVStuRHZZVks1WGIzbHBwbmJTbngzWlUzUGhicHpBeElCdVdUZ1JhLzlocDZQWDZmTWRWblBXdWJSVDRmRlFUYnFNMlFLalpxZFREZHYzMVVHRVBGUXRNd3hQdllSTFdBR1JiQUY4dm84aWNTQkM1M2tnMHF0TDF4WTMweTJQb1lveXFlSFQ2VWRCNDZSeXEzb1pnMlBiSHlOaGRXOFBwRkhJQ3RrckM4bTNhRXM5cGw2Ymx3U3dFMDFBUXI5ZUVnc3pWcVdSalh1aDhvQTFqejBVT3JlT3hpcCtPekdxV3lCMlRMV0Y3WG1ndEZ0U1ZFRzhKa3hiNWp3VEtFeG1VSy9zLzJKSEs1YnBITGpjWFNNNXJNYlozTnZPbDhHNE5DM1QvQm9RUmxBUHUvUG9tWTFBY2lmbjQyS3AyUDVCVW9CbnJ0UnphTWVYOTA0bnhzUmh3eEF0TDVjU2NYeGI0WlhnS3p0T1VlVUFuVGNjWnZaRzEreU13NEdXQ1lEOE9YRTNTcmpIN292aStucEVmRk5BRUtpTmJaL3RFY3B3TklIdFRUN3J6ZDk2ODVvZWhrbkVtcGtHcEdYNXU5VUMzRENJZ0NjN2hVZ055UnJ0KzFTQ3ZBN0pDdm1mT2dyUUdjTno3NTVwQ3d3cVdVczhLbm1zc0Q3dGZSN0h5MFFxcE1HeVBrKzlURXc0WHRqNEVmNzFJNUlidHh4eS9RRjZ5UmQyRVhEdUJXT2JabFcrT2VqcHRPUnZDK1ZBang3bzBwa3JTMit4Y0FhQmxqVyt2cUJjN3owQTIzMHdxUTNxTWpoVkFvdys0elJENVJvUkJ4U0l4RzdBM01kbTVYR1FXUmhHRnFUa1Vqc2dwVlVVVld0ZENTeS9CT1prWWp6QnNmQWZOa3BTc3hicU0zRVRQanZoZ1NsR0lsay92MFRVcmxkTHFuaERMVk1YakNmQVdiTHBySkdyN3VNbFB0N1NxM3dtZEVOYmd4NHduMHZYWE1vemNaay9hdk15TWI0bkJQY3hTNHNrZ21TVXA2UitlWDRoY2pBVEJNUSs4QjlVK3picUxhdVRobkFLN0MraEt3U2lkUStRSXRrQWo4eWFxU3paRFFtclpnR0tJeUYrTU9JeHFTUFNDTE1vNHNLclkrbk8xZnZsNGg5OWFvR04wNW42UkVZMDdua0o5RmROR3JWMTBvVHF4d0xmekY2Rm0zNytLQXFkckJxRCszTXYwL2o1T1pFdUFGeFFlR2RPQzBONWZxNzVtWDQ4anhlWGFCZ1ZpNEZvNUlVaWtuZVRvN1NDbVVUU2p5MUdidFJOQnl5aTVoT1FKelMxNXRNS3NrS0VFMUxoRktDQW84MVlFNFdKcSt1VXRybmQrbEJWWERqSDg4eDUzeFZMajJsMlNBOUxRWno2dVpxVkN0S2R5RExPa2F0THVBMUxwd3JORUVHTXJHT3JQY20wZHFiMTNyL2FCbkhxcUJsWERZZEsrTzhuMy93TkxCaVpwck9BSFdvNmNTNnZGeThwb1g3aUZqamt1NXRiWXpQOEY2WXRRRVRWNWZFT2EzR3FHQXNyckgxK0QycWR2c1A4VDZzK1BERkNwci9qMXVCTFhuVDlDSW9GSHIwaEhrWCtITldZQXNiRzZ4eDlQb2lHckwwQ1AxMnpsWk12SytoWDhXK3pYQWVZNW4xUCsvL21zYkRSVDVQNHdyeVBnZDZzWVROL2REalc0eXI4d2pYdjRMSm90MUkxUy9jV2NybmFEcnpKbStCVzZBdWtQSE1yOFRpSWhtTHhMby9ZVW5EM3psRlE1WWNva0Z2N29OMVpYcUZDSGk4T290YmR0UHl2UDZSTU5EbjhTcXZiZm5lTGdrdmU4dUN0YTdGWkhraXJDMk80MXpnNndOTmdaSE9yTGdCYnZSQWpjVHlOdG1WV3d4RUtMUEVhejRSbjBVak5ITGxPZjdlWXkxOUVtTFhQa0JDRjhScmZKdjF3VTJLVHBkY29TcS92SzNKNG5LL0YxZ0dNaVdBZmVIbUkxSlArN3hLRmRiRVhRL3VnbkJYUkNJbEg1aVlEVFRYV3MvSzYyTmRvVkJoY3dHRUs0c1ZyTU9XbjJ3TXoyZUljWnRkdk5pU3g3RUtBRW9zOGVYTnBJb3lDZktvQnNqdytzV3RvS0hManZ1OTBKd2hUY2Y0OWVUVkt2VUE2NjB2c1luMWVWbG8zZ3M2b3hRZzB2YjliTy9RcTB1UE5vbVpza0tMeW91Q01KOWJwUmFnSnBqMGdueDVwTjlwUTFtdEFpQlc2WE8zUnZRWGNUM3Y4T1FoQ21pRmVnM2RWZ09RV2RpTUI4OTllc1ExQkJDVlBPbzFjT0UvYWRDaUhCTmUwRnBIYm0zbmJyOUZYeFJWMHV0L0N5NUFnTnNCSHN6RXAyZmx6UGNqQlAxaFE0YUZmaUZQQzBqQWs0cUo2TUtVMEJRak9SQWtlR0NnaHpNOGE2WXUrN2lybm9CZkR1TGpycUpTY3ZEa0lRYnYzS2c3T1BEanJ0S1AvNXRqNUc2UXZhTStjQTNyc3hzTS9IOWJCMHkzSnl3eXA2TUJoQlhuY04xUkJ2UzZFOU1TdzNEU1V4MEdIdGRWYzRaWmpCRmFRSnVsSWRrUUNSVjBnR2VEQzFEblNDTlpFT3dYN3pqN1F3WHQyRzNGaTNkUUtueDdrZWJzMXg3ZEdlNTZtdXNtL2RZaWVYZkdCVVJNNUJkMnRaK1hqM0dkek82YjBpMG13MlZhSXJkUTlyYjgranVqajZ0eFhZU0gyYi90MUZ5Ym1UL3NCcGp4VUhFYmJHbUxvWGlKZnA2aVY0RGFSV3pzaTV2YWdiS3FEWUNyZ3B2dVJOblhtdWtVaHRDaW05bmNBMllJeWlrb3owSzFyVEhXUVdjQnpBYUFJZGh2Vlcvek5ibzVMZ2I1QkdKS0lsUm9hV1d2UWVaY3AvbG1wbGE3NFNiTmJFNXZRUHdqeEpNd3plL2E0cHA2SHNSekdMMVJxckk0ZFYwZUdwZ3ZYZ1VQUlFGc0Zzb2ljd1dFSXJrdG1uamRmQllVRGZXWXVORWhMSzdOYmlNM2x3T2ljSnV1S0h0REZ1eW5RU2NBRlN1Yy9QOW5CTVlybVZ4UUxpdytEYkppUHhUcVdwOWR2OU5HS01tbnlUb0R3QTh0OVcrSW00elBxZmljRGFENWtBT1F5M0M4cHI2akRtRWZaUm5rZ1BBZFBSdkhVcUhKVUFTdmtnS3d6bEN6MStjLzZmS09nOVlZdnpjQUFBQUFTVVZPUks1Q1lJST1cIixcbiAgICAgICAgICAgIFwiZGlzY292ZXJ5TG9nb1wiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRkFBQUFCUUNBWUFBQUNPRWZLdEFBQVBFa2xFUVZSNEFkMmNhNHljVmYzSER4UW9mL2dETFNJYUVVclF4SXNrR0gwaDhTS0tJUm9KTDhRb1lvUkVFeE5GWXpRa2xCY2twbUFGaE83T1piWXRVdEJDYmFHVXRxaTB1enYzN1c1M2UybHAyZDR2MEc0dkxHMjN1OXZ1em5PZjQvYzdEeWM4WGJxek0zTm1aM2I2SkNlemx6bm5PZWZ6L083bmVSNVI2MlA5QzFKSUtVVTI2azVQUisyYlV4SDdlOG13L1ZBeWJEVWxRdGFxUk5oYWo4L2Q4WkRabHdpYng5Q080dWZEK05zdS9LOExueXZ4M1huSmlQMWI5TDB6RTNWbVphTDI5RmRtRDRuczg1NjRJSTkxTVUrc255OUZKdVpjQzJqZlRrYXNSd0ZqRmNBUTFHQjdzK0dnNWRHa2FtM05PZG5XNURmK3pMOEZHcjlybysvcFJNZ2sySldwaURVYlkzOExiV1ltTmlJeTBWeGpRMHNEV0NycVlDSGUvMEZTdmc2cG1ZdkZic0NpaHhVc3doblRDS2RJSzlvbno3RnhqbTZjNndtYzgvWk0xTDA4aVRuc3hGd2E1dGp4cWhTdno4bUpUSXN6QTR2NENhUmpOUlkyd0FVV0FhWGJ6Z2Z6Rk03OU91WndMMEJlRTQrNm9pZnNUbDF3dEczeGtDWFNVZWRxVFBwK1RENkZoUmhvR3REMFljYWJqUnlrTW9FNS9UUWRkYTlLUUNLN0kxUExWaElhbklKektaekJEMkRrV3pIeG5DNjQ2a3NsUVZwck1NZTdZRll1U1VmY0tlQWNvQlpydzRaSVJaeFprTGd3cnZacFRqWmcrTFZiOVNYU0hFakFpMlBPTjdhSEhORVJNK3NEanc0aUhmT200WXJlRFh1emlYYW5aaEtuRDlMRG5Ic3c5KytuSTg3RmdGbHpsV1c3RWxmeTBmWm04NVNhSEQ4Ym9RWHM0d21zNGVGTXpMNEM0VThOUEt5VUloMGhQUHQ2MkpPRm1JUlpmNm5UbGtZRGE0bENDcTlMaFNjUlltYWVGQWlBQ2ZCbUJzRlVneUxnR2swYVhhenBOV2pWVFl3YnQ4eXBjdHpZODVJcEVKeFM4ajZEa0tDOTlpcGJHNVZHMnJnRzJSSUZSQnhmWEVXSUtVb2U4bFlOZUEwRzBiMFJPWGFWSEViRXBzTzRubXFyQWEvQklGckxJVERYYVRzVzMyRzRWOExJTHRDd2VZMEkwUVBFQ0ZKQTV2R1Z3VXRTOHVibkw4WkFzNVczcmYxaWRKc1dSQU5yLzFObmk3eW9iSWpwa0NuaVladU80NGVJODA3V0J4N1BtWlB4Y0prdHhFK01FZElxWExBZnM1WitwbjdNOGJOUm8zU0E2RVFKbklWb2ZhTWFyQjYyYUhmYWxpZmVjU3RxNys5MzVmWTNMWXhUR1VUVkJ3eTZJSUUzb0pVS2p6VzgvQ1VRMythYXd3dGUvWWdoVHg1eVplNk1KOS9iNjViZTlnRGVBVmM2Wmw3YWFMdFNOcVRSMElHWUI0dW5zekYzMm9RUTIrYm1LSG1DT1NLVGJqMTQrZ0JQSFhibDBaME9wYWlzbGw1b3lETW5QV21jelVzcmw1Zjd1MnlxZGNVUXdlSWttTnhKTnN1ZkhKaWdMQlh6cm1iWlIzV2VSRWpqdEEvUHU2L1RsanZqdHZwN2lRMEFGL2dBRC9UWWhGZVF4SGMzT3pJWkszOU42dnRnOGdaS1lQOC9idUZoN2RPKzlDRWZ2SSsxczZyRDQrSUlZcDdmcUZaY0VLVWw4NXhSV0hRaWFoUWtxRlY5Wjh3aVNta0s0TmxUbnR5N0R2QXgzcDRNSUJwNWVlUnRSNmJtR3h5N0VvZ2pyRzdUUDd3WnlwMWYraEQzekFEcEJEdFZzNTZud0tWYURMbnBOYk1nRmYzN1hEbjBuaWZQRG5oeTVMUlhXUERwbzU0OEJwWGREYnUxZm9sSnRTTk1MWUN0ei9qOWU5c3NhWTdtNWZFOUxpOFk1MU5KZ0wwV3R2Q3FqMlFwUzJiM0M5QmwrM0ZjU1Y4VndYSEM5S2lEeHoxcFFSSkdCNzJDcHp5ODFTbkEzSWVGSHVpMjVaRmVSNTQrNHRKMmNiRUZaL0RXR3hZbGsrTnd2TElBdnJQSmtkbm5EZG54Z3Q4STFMSHk4c1JCRjcrWEw5bHhYd3J2S2JBNlYvb3MyRDduOGlRMllZTEV0UjBCMUhUYmZ5dzUzQTl3QUVJUHlkKzVLR1hVS1dGc0NoQmhkZjdUbERzVE5tRVdWSzhmSVVuM3Y4eVM0anIrbjJvNmhIUFM5dVdHdlhPYTYrUWxEMTRzUDFZc1R3ckJhRmxIekx0TWVXVHhsNjhVOW11cHdyY2o1amxaTFhncFNNRWhTQmdCTUx6WXNNd2tVTUlhRjBSYndFN3llN1NSMi83clh3RGpUSjRPaFdQd084VVhpdTlzWEc3SzNyV1dmSHRzVzJQQlZMankxQ0czVE0rc2hNSjhIeW51VjJueWRyMHJoV2h2eW9uV0pvT2h5K1BxUzVyd3FMSzBjUXdoYU1ETFVzRmdVeEthL2J0QkIwQ0pLaWtrQ1Z5RWo3Wm5jL0xvRGljQXNIeVBET2w3ckxWNVZDUkQxZ2ZPSStiT2hJSHNyb3JrdFJoVVZkb3hxbXZaNlJRWE5MWVBZU1FpQnUwa0pab1hwYUlNUTQwZEJGaUp3SUJWQjV6Sk5SbFdheUNPM0NENkprUnpTRWY2bE9xOHM5R2g1RkgxeXBZNkJZNUJOTWZ5K3dmVUoreVBUM3U2OVEyT1gzT0FTbzFQUS9DK1Z2REdvTW1DNlNPNjZzdkZiRjFsRVI2OWFnV1M1OXU4dlIyMkhPaHo1ZkhkcnV4WmF2cGpOSjByNGZTaVowNTRzbU9SbW5OdEFmSVRNZk1mVTFUaGJNUzlUSG5mZG8zeUR6MGZ2U1lubG15cGJHRjdzN1p5T2dWQXcrOTc5TmdmVVdkNlpEb1ZTbU43NFVKcEFDeDN6Ui9HaE1zeUxmbExCZlQ0SnQ3aHBDTjlOTTcwYnBTK0xTc3QvbDVSeUhQeVhaY2hTK0YzQnR5V29jWWpwSE1oSE54Z015eGh5RU9vTmJXQjdBTm0yMkg2Ym1Edy9GM3FOUCtvay9nek1DYUFSS1RrU1FYeVhoOFlBMndHd0Z0Z0NpaGQ1a2llMGtaQVFlM2c3d1JIS1dSd3JBbXdzalV6NUlQLytBWUIvb2IzMmxVS2tKUHZlc25rWWhIOGppOTluQ2kvTzdZeEl6aTB4WGNNVE8yb3RsUmpaaUw3MTU4L1pPRllESUxwN1FlT3VBeVQrSjFhU2lBL0xiRDdKZmQ2bjlWeElBVEdQSk1BQ1pKUXhwczRwZWxnRDlJMmdLR0RZR0RNWEppU3hQaE9GUlkycnpCbDl4S3o2QUo1M2gxeHF4QXVkUzNtZVNzQnFFeERaWFZDeE01L0ZZbVFYdnJHZnN3NG1EcU41enk0T0FJYkdmUUxCL3lrdmFUVUhlMTFDSjc5VkNPY0NVTWdOU2JIWUw3Y3F0UzhkaEpJUjdLVVlVeVh6cVlQNHpXV3o1bjQ4K2Z4QUZMeWFPTTYvMkd5MGtLSnBlcWlqNElWSExlMFJXUVJ4dVNHUEJZcUNMQldLcXdhSFVtYUVyaEx1M0xjNTNKU3F2QjVYb0JVVVpibm1STnZXcUZzcHMzVXF1SnpxNm9MYldWOUFGcHZDZDRCMzlaYytTTG9kV25Jai9RV0FkamtlMDBXQmVnY0dKNHdCRm4zb2ttNE9yRW5LODlNOFRoT3pieXdhbUMzWC9BeEFxMFFKdXpIYnl4VSt2bnB1TjhGTUtQZ3FmdTIrMTZYbVlzT1FEb2MybFNHTXJXWHdNSmV5V0VDUEZZeFFEV2huUTdUcjRsaVFQNlBLc3VValF1ZzVGS0tLalBrakFVWG0vVENMRnZWSEtDdnRXWWZWYmlQditoa0ljeDk2U0JVMmxYSzRqZXY5RE1YYmpzU2FybUZCNTUzNjJwL2pBMnYwQlRVM2dhQzNRRUF0SFpyYlJRUnhncVZ4cGxjV01tcEcrMG1WWkJscjBEY1Y3SUVNbHVoRThrczlQdVYxT1pWMVlsc0U3cDFRRTVBN2NNZWZrczVrdElsaUNWMnh5eVNlUlJ4SUhSS0xMVFNIakdFWXVHVm1jMUVqY1hlS2dITU1veFpyUmRJcy9uU01EcEV6K3BMeDBSOXVPaStiWkRBQVk4Z1VSendjMThHeCt3L0FYeldHMVh4Z2lhQTJRaUIwcnRQMkZ5SEcxWlZDYVJmNVExRW9XclVBcmtBVG80Z2xib1VBMGdWWmwyUFJRakMzUGlxNlFOWnBiS0tpVXRuN0t2eVlHWkJOQVc5YlNXMXdDYVZVVEZBcE1GUHM1andlL3ppNkFCVVVzaDRqRkswY1hseEtWS0ZoVjFKdi83SFRLWlEvK3N2N29qVWhXSFl3akNJT2JNNmowb0JTMnpzcDN2N200Mmk2cThKOEM2Vzg2dTFtY1FkcjhGakJGRmNsZFVXSnRNdzNnTVRyRUMzRllGT2FMeEkzUE50RDlYdjVpYysvNWVLT0hmd2JvUmJrTlB0cmNKRXVFQ0dGRlJsMmhnQ25RaWlDc1lEZXlEajc3SVJNTDB1VlQ4UVA5WUZJSmp0NUYzOUl0dmlYZzVqK08vcURNeVc0NFlQQTF4bUtLcGl6TDhYNnpPUjJ0SlowT0dvVGZGZ0RiQXVqVStDWnJIQkx1SmhpNDdrTVExSE10NkMxVDB2Tk83bDNPZWlvUEw3TEJqd0xpM2FQRW8xaXhKME5peWgxUVZpWUZQcGtXVEVGQ0lkY3dRZm5ZZFhQRnZ0ZTJKWTU2T0RVQnRGbTErMy9Gdk1nb1k4RU9DcXZ5dDdTbS9KKzJrSWozc2dTbTJadlhETXc3V0hxT3pmTUorT3o0SWQ5NFZoQjUyUFE2ZTNWSE1peXVnVDJJNTJpd1ZYTHBvT2hyVkJGa0ZaRjJSZ3k3cGVJWDdzV1dieTlndkdoNVJjU2hvM21lalZHZW9FVkowZXZENFEyL3huU1hyODF4ZHdYN2paRkMvUE9VSTEvbHNSTmRhV1JxcmlkZ1MveDNjeGVDWWNQL3RnalpCT3g4QW5KWTBlbHVFTWk2MEV4M3JqR0JzNkJtTE4xRGw0ZzlIY3RmTkdDN2ZGaVBZbkgrYXpJRlRqTy9nQ2lNbWFoTEpwWERqVms5TEdiSUpGVmQ0UFNDbGxSckwrWlpPYjV3cjhlRkFVUlBZbFJBSlhFQ2M5ZkVuakhSQTBmUnR1NlJaaSs4VVNBRzNSMGVMeThkVTF2cGpXNE5iZW9nRnVDVUZ1VUJJVHZtTmhMcTRQY2NMMGJYVW1oZ2R3Z2s4eExYOXFVSUFxcGZBQmJ0ZlZ4SjRRMEZoSUZXUUdOYktKYWp3RGpPNURFNnVmSFJEQlF6bVQ2eElodGNsVXZ4aHJxa0tFbzgyQUVkOTljOTZIYTFnYjVPZXZnbExZY0JDckgrS29NY3hVeEhvQUtnekhPenJlWTYwTzI4ZElPdEN4SVNYUk12aG9nejVFMVJkTTR0RFNHVVVmdG9rL1k3REFTaW04RjUzT3FNNk5DbEhmTzZ0KzVoQ1kzSU1tMW9aeW91aEJ3Z2dRcDhNV0xxcS9GT28vYTJkVEVqYzVDRCswSHJKWmtJbmxjV081Vy9yemNxRDllY1E4T3poQWcwdGlSZUZONEdIRGJXRHhXYjd5b09Rak85OFNyZk1NUXVSVFM4TnFzQWFGcUhNbjZpRE5XVHdFRnMxMnVlOUo0TTNuM3FVUTN5Y3hrTnZBRUN1RjU4QWZ6TW55TlZGZ1VkRUIrclNKTStDQmxqYXFLbXRrSEl0VFVlY2FQaitvZGFRS0VKMVpnSmhzR0lqNklVc2JIT21ucVlYYVI2clpoU3JiYU02WGtpampYT2l2UGNFYU81RnBmSTVyanM5MVJGV083b1dTKzhlRWVGdENBMklEd090Q2tmVFdWTlFTblN5V1Z2UG9hUEVFVGtDSXR6WnFwbElFWGg1clNpRFAvVUlhSm9zdmFaeVVveFd1M0xlSmhiY1lMVzhnNzF6YzI0YXNwZHhoaTJOOVc1ZElNZWtIZ2twQ3ZCWW41ZzNxWjFXbzBJQ2h6Umw0MjZmZ2JXZlMyOWIwU1BQdEhtRm5PaWJ3SUtMMWZRMmgwb0VMelZjd1F4RHVCenoxN0cvdGo0NkZqdWp2a1pSSTJFV0xzZUxvVkFVWm1OTUk1dm9TUXBRdnp2bnoyeFFDVWZlRHVYTXE3RnlKd1BzWGZGbVBmNi9OMUFBWjJCNncrZHJQUk5pK0gzTzlBcDlpU2gyWmlDdGVXR0N5c3YxSmdQeERBa2s0UWRiN05jaStrekMzWWs2L3crYlpKMVlzSEJZZFlVOU0yYU5ydmlkNlg1UXNpZkYxU1EvQlJxNkxLOVdlL0JkeEIyeWNNWXFZTmN0SDJUSVI1MU43TWFkT2hHSU5jM1RFOGtKK1IzS2ZaV1k2eW1La3RZak9CakN0NEtMTGcxcThIOFkySVcxN2NLN25BTzV1eEt3emtnOWlEb3NjMGRCSE1zSVhkYnZUb040MzhkVXF2S21Ua2dtZ3g3alRoWllmRDFBUndIa0F5MkdNbzREV2dUR2JNUGFQY01GdTdHcnhwcVZqcnJnZ2owNUlKdC9KOTRGa2ZobUwvamsyYTU3ZzdiSm8zUUJ5RU8wVUd0VGV0Tm53OHdqL3h2L3hPMml2b04vamFEK0RxYmdOWTgzQXc4OFhaYU8xVjlIL0FTNEtuZkpXZFRFQkFBQUFBRWxGVGtTdVFtQ0NcIixcbiAgICAgICAgICAgIFwid2F0c29uUGljXCI6IFwiXCJcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRMaXN0W2VsXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudExpc3RbZWxdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgRWxlbWVudCByZXF1aXJlZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24gKGVsLCB2YWwpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50TGlzdFtlbF0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxufSgpKTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBkYW5pZWxhYnJhbyBvbiAxLzE2LzE3LlxuICovXG4oZnVuY3Rpb24gKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAod2luZG93KSB7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuUHJvbWlzZSkge1xuICAgICAgICAgICAgd2luZG93LlByb21pc2UgPSByZXF1aXJlKFwiLi4vZGVwZW5kZW5jaWVzL3Byb21pc2UucG9seWZpbGwuc2NyaXB0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbnZlcnNhdGlvbkNvbnRleHQgPSB7fTtcbiAgICAgICAgdmFyIHVybHMgPSB7XG4gICAgICAgICAgICBcImZlZWRiYWNrXCI6IFwiXCIsXG4gICAgICAgICAgICBcImNvbnZlcnNhdGlvblwiOiBcIlwiLFxuICAgICAgICAgICAgXCJleHRyYU9wdGlvbnNcIjogXCJcIlxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcInNldFVybFwiOiBmdW5jdGlvbiAodXJsLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgdXJsc1t0eXBlXSA9IHVybDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldFVybFwiOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cmxzW3R5cGVdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibWFrZVF1ZXN0aW9uXCI6IGZ1bmN0aW9uIChxdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IHhodHRwLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udmVyc2F0aW9uQ29udGV4dCA9IHJlc3BvbnNlLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb252ZXJzYXRpb25Db250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHR0cC5vcGVuKFwiUE9TVFwiLCB1cmxzLmNvbnZlcnNhdGlvbiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAuc2VuZChbXCJxdWVzdGlvbj1cIiwgcXVlc3Rpb24sIFwiJmNvbnRleHQ9XCIsIEpTT04uc3RyaW5naWZ5KGNvbnZlcnNhdGlvbkNvbnRleHQpXS5qb2luKFwiXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChcIkFKQVggQ2FsbHMgbm90IHN1cHBvcnRlZCBvbiB0aGlzIGJyb3dzZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldEV4dHJhT3B0aW9uc1wiOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeGh0dHAgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAub3BlbihcIlBPU1RcIiwgdXJscy5leHRyYU9wdGlvbnMsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLnNlbmQoW1wicXVlcnk9XCIsIHF1ZXJ5XS5qb2luKFwiXCIpKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFwiQUpBWCBDYWxscyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3NlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2VuZEZlZWRiYWNrXCI6IGZ1bmN0aW9uIChvcHRpb24sIGZlZWRiYWNrT2JqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLm9wZW4oXCJQT1NUXCIsIHVybHMuZmVlZGJhY2ssIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLnNlbmQoW1wib3B0aW9uPVwiLCBvcHRpb24sIFwiJmZlZWRiYWNrPVwiLCBKU09OLnN0cmluZ2lmeShmZWVkYmFja09iaiksIFwiJmNvbnRleHQ9XCIsIEpTT04uc3RyaW5naWZ5KGNvbnZlcnNhdGlvbkNvbnRleHQpXS5qb2luKFwiXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFtcIm9wdGlvbj1cIiwgb3B0aW9uLCBcIiZmZWVkYmFjaz1cIiwgSlNPTi5zdHJpbmdpZnkoZmVlZGJhY2tPYmopLCBcIiZjb250ZXh0PVwiLCBjb252ZXJzYXRpb25Db250ZXh0XS5qb2luKFwiXCIpKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFwiQUpBWCBDYWxscyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgYnJvd3NlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2F2ZUxvZ2luXCI6IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJpbmZvXCIsIEpTT04uc3RyaW5naWZ5KGluZm8pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldExvZ2luXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcImluZm9cIikpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG5cbn0oKSk7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgZGFuaWVsYWJyYW8gb24gMS8xNi8xNy5cbiAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBnbG9iYWwsXG4gICAgICAgIGFwcFBocmFzZXMsXG4gICAgICAgIGFwcExhbmd1YWdlLFxuICAgICAgICBmYWN0b3J5LFxuICAgICAgICBjb250cm9sbGVyO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgZ2xvYmFsID0gd2luZG93IHx8IFwiXCI7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIk5vZGUgSlMgZW52aXJvbm1lbnRcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29udmVyc2F0aW9uV2lkZ2V0ICh3aW5kb3dPYmopIHtcbiAgICAgICAgdmFyIHdpbmRvdyA9IGdsb2JhbCB8fCB3aW5kb3dPYmo7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpbmRvdyBvYmplY3QgaXMgbm90IHByZXNlbnRcIik7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiBpbmplY3RDU1MgKGNzc0ZpbGVzKSAge1xuICAgICAgICAgICAgICAgIHZhciBoZWFkQW5jaG9yID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoZWFkXCIpLFxuICAgICAgICAgICAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgICAgIGlmIChjc3NGaWxlcyAmJiBBcnJheS5pc0FycmF5KGNzc0ZpbGVzKSkge1xuICAgICAgICAgICAgICAgICAgICBjc3NGaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpbmtzRWxzID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmhyZWYgPSBmaWxlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsucmVsID0gXCJzdHlsZXNoZWV0XCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlua3NFbHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGlua3NFbHNbaV0uaHJlZi5pbmRleE9mKFwid2lkZ2V0LnN0eWxlXCIpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRBbmNob3IuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vSU1QUk9WRVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBpcyBub3QgQ1NTIEFycmF5XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0oW1wiLi9qcy9jb252ZXJzYXRpb25fd2lkZ2V0L2Rpc3QvY3NzL3dpZGdldC5zdHlsZS5taW4uY3NzXCJdKSk7XG5cbiAgICAgICAgICAgIGFwcExhbmd1YWdlID0gKHdpbmRvdy5uYXZpZ2F0b3IubGFuZ3VhZ2VzICYmIHdpbmRvdy5uYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdKSB8fCAvLyBDaHJvbWUgLyBGaXJlZm94XG4gICAgICAgICAgICAgICAgd2luZG93Lm5hdmlnYXRvci5sYW5ndWFnZSB8fCAgIC8vIEFsbCBicm93c2Vyc1xuICAgICAgICAgICAgICAgIHdpbmRvdy5uYXZpZ2F0b3IudXNlckxhbmd1YWdlO1xuXG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCJpbml0XCI6IGZ1bmN0aW9uIChjb25maWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcFBocmFzZXMgPSByZXF1aXJlKFwiLi9tb2RlbC9pbnRlcm5hdGlvbmFsaXphdGlvbi5zY3JpcHRcIikoY29uZmlncy53aWRnZXRMYW5ndWFnZSB8fCBhcHBMYW5ndWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGZhY3RvcnkgPSByZXF1aXJlKFwiLi9mYWN0b3J5L2ZhY3Rvcnkuc2NyaXB0XCIpKHdpbmRvdyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9jb250cm9sbGVyL2NvbnRyb2xsZXIuc2NyaXB0XCIpKHdpbmRvdywgZmFjdG9yeSwgYXBwUGhyYXNlcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maWdzLmJhc2VVUkwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgcHJvY2VlZCB3aXRob3V0IGEgdmFsaWQgVVJMXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maWdzLnBhcmVudENvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBwcm9jZWVkIHdpdGhvdXQgYSB2YWxpZCBub2RlIHBhcmVudCBlbGVtZW50XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3MuZW5hYmxlRmVlZGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29uZmlncy5mZWVkYmFja0VuZHBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgcHJvdmlkZSBhIGZlZWRiYWNrIGVuZHBvaW50IHdoZW5ldmVyIGVuYWJsZUZlZWRiYWNrIGlzIHRydWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhY3Rvcnkuc2V0VXJsKGNvbmZpZ3MuZmVlZGJhY2tFbmRwb2ludCwgXCJmZWVkYmFja1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZhY3Rvcnkuc2V0VXJsKGNvbmZpZ3MuYmFzZVVSTCwgXCJjb252ZXJzYXRpb25cIik7XG4gICAgICAgICAgICAgICAgICAgIGZhY3Rvcnkuc2V0VXJsKGNvbmZpZ3MuZXh0cmFPcHRpb25zRW5kcG9pbnQgfHwgXCIvZ2V0RXh0cmFPcHRpb25zP21vZHVsZT1ocl9tb2R1bGVcIiwgXCJleHRyYU9wdGlvbnNcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuY3JlYXRlV2lkZ2V0SW5zdGFuY2UoY29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChnbG9iYWwpIHtcbiAgICAgICAgZ2xvYmFsLmNvbnZlcnNhdGlvbldpZGdldCA9IGNvbnZlcnNhdGlvbldpZGdldChnbG9iYWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gY29udmVyc2F0aW9uV2lkZ2V0O1xuICAgIH1cblxufSgpKTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgZGFuaWVsYWJyYW8gb24gMS8xOC8xNy5cbiAqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBsYW5ndWFnZXMgPSB7XG4gICAgICAgIFwicHRcIjoge1xuICAgICAgICAgICAgXCJjaGF0XCI6IHtcbiAgICAgICAgICAgICAgICBcIndhdHNvbldlbGNvbWVcIjogXCJPbMOhIHt1c2VyfSBjb21vIHBvc3NvIGFqdWTDoS1sbz9cIixcbiAgICAgICAgICAgICAgICBcIndhdHNvbk5lZ2F0aXZlXCI6IFwiSW5mZWxpem1lbnRlIG7Do28gZW50ZW5kaS4gVGVudGUgcGVyZ3VudGFyIGNvbSBvdXRyYXMgcGFsYXZyYXNcIixcbiAgICAgICAgICAgICAgICBcIndhdHNvbkVycm9yXCI6IFwiVW0gZXJybyBvY29ycmV1XCIsXG4gICAgICAgICAgICAgICAgXCJ3YXRzb25GZWVkYmFja1wiOiBcIk9icmlnYWRvIHBlbG8gZmVlZGJhY2tcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZWxlbWVudHNcIjoge1xuICAgICAgICAgICAgICAgIFwiZmVlZGJhY2tEaXNjbGFpbWVyXCI6IFwiSXNzbyBhanVkb3U/XCIsXG4gICAgICAgICAgICAgICAgXCJmZWVkYmFja1llc0J0blwiOiBcIlNpbVwiLFxuICAgICAgICAgICAgICAgIFwiZmVlZGJhY2tOb0J0blwiOiBcIk7Do29cIixcbiAgICAgICAgICAgICAgICBcIm5hbWVJbnB1dExhYmVsXCI6IFwiTm9tZSBjb21wbGV0bzpcIixcbiAgICAgICAgICAgICAgICBcImVtYWlsSW5wdXRMYWJlbFwiOiBcIkVtYWlsIHbDoWxpZG86XCIsXG4gICAgICAgICAgICAgICAgXCJsb2dpbkJ1dHRvblwiOiBcIkxvZ2luXCIsXG4gICAgICAgICAgICAgICAgXCJpbnB1dFBsYWNlaG9sZGVyXCI6IFwiRXNjcmV2YSBzdWEgbWVuc2FnZW0uLi5cIixcbiAgICAgICAgICAgICAgICBcImV4dHJhT3B0aW9uRmVlZGJhY2tcIjogXCJGdW5jaW9ub3U/XCIsXG4gICAgICAgICAgICAgICAgXCJleHRyYU9wdGlvbnNOZWdhdGl2ZUZlZWRiYWNrXCI6IFwiTmVuaHVtYSBkYXMgYW50ZXJpb3Jlc1wiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJlcnJvclwiOiB7XG4gICAgICAgICAgICAgICAgXCJpbnZhbGlkTG9naW5GaWVsZHNcIjogXCJFcnJvIGluZXNwZXJhZG9cIixcbiAgICAgICAgICAgICAgICBcImVtcHR5TG9naW5GaWVsZHNcIjogXCJDYW1wb3Mgb2JyaWdhdMOzcmlvcyBuw6NvIHByZWVuY2hpZG9zXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJlblwiOiB7XG4gICAgICAgICAgICBcImNoYXRcIjoge1xuICAgICAgICAgICAgICAgIFwid2F0c29uV2VsY29tZVwiOiBcIkhlbGxvIHt1c2VyfSBob3cgY2FuIEkgaGVscCB5b3U/XCIsXG4gICAgICAgICAgICAgICAgXCJ3YXRzb25OZWdhdGl2ZVwiOiBcIkkgZGlkIG5vdCB1bmRlcnN0b29kLiBUcnkgd2l0aCBhbm90aGVyIHdvcmRzXCIsXG4gICAgICAgICAgICAgICAgXCJ3YXRzb25FcnJvclwiOiBcIkFuIGVycm9yIG9jY3VycmVkXCIsXG4gICAgICAgICAgICAgICAgXCJ3YXRzb25GZWVkYmFja1wiOiBcIlRoYW5rcyBmb3IgdGhlIGZlZWRiYWNrXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImVsZW1lbnRzXCI6IHtcbiAgICAgICAgICAgICAgICBcImZlZWRiYWNrRGlzY2xhaW1lclwiOiBcIkRpZCBpdCBoZWxwP1wiLFxuICAgICAgICAgICAgICAgIFwiZmVlZGJhY2tZZXNCdG5cIjogXCJZZXNcIixcbiAgICAgICAgICAgICAgICBcImZlZWRiYWNrTm9CdG5cIjogXCJOb1wiLFxuICAgICAgICAgICAgICAgIFwibmFtZUlucHV0TGFiZWxcIjogXCJGdWxsIG5hbWU6XCIsXG4gICAgICAgICAgICAgICAgXCJlbWFpbElucHV0TGFiZWxcIjogXCJWYWxpZCBlbWFpbDpcIixcbiAgICAgICAgICAgICAgICBcImxvZ2luQnV0dG9uXCI6IFwiTG9naW5cIixcbiAgICAgICAgICAgICAgICBcImlucHV0UGxhY2Vob2xkZXJcIjogXCJUeXBlIHlvdXIgbWVzc2FnZS4uLlwiLFxuICAgICAgICAgICAgICAgIFwiZXh0cmFPcHRpb25GZWVkYmFja1wiOiBcIkl0IHdvcmtlZD9cIixcbiAgICAgICAgICAgICAgICBcImV4dHJhT3B0aW9uc05lZ2F0aXZlRmVlZGJhY2tcIjogXCJOb25lIG9mIHRoZSBhYm92ZVwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJlcnJvclwiOiB7XG4gICAgICAgICAgICAgICAgXCJpbnZhbGlkTG9naW5GaWVsZHNcIjogXCJVbmtub3duIGVycm9yXCIsXG4gICAgICAgICAgICAgICAgXCJlbXB0eUxvZ2luRmllbGRzXCI6IFwiTWlzc2luZyByZXF1aXJlZCBmaWVsZHNcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImVzXCI6IHtcbiAgICAgICAgICAgIFwiY2hhdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJ3YXRzb25XZWxjb21lXCI6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCJ3YXRzb25OZWdhdGl2ZVwiOiBcIlwiLFxuICAgICAgICAgICAgICAgIFwid2F0c29uRXJyb3JcIjogXCJcIixcbiAgICAgICAgICAgICAgICBcIndhdHNvbkZlZWRiYWNrXCI6IFwiXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImVsZW1lbnRzXCI6IHtcbiAgICAgICAgICAgICAgICBcImZlZWRiYWNrRGlzY2xhaW1lclwiOiBcIlwiLFxuICAgICAgICAgICAgICAgIFwiZmVlZGJhY2tZZXNCdG5cIjogXCJcIixcbiAgICAgICAgICAgICAgICBcImZlZWRiYWNrTm9CdG5cIjogXCJcIixcbiAgICAgICAgICAgICAgICBcIm5hbWVJbnB1dExhYmVsXCI6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCJlbWFpbElucHV0TGFiZWxcIjogXCJcIixcbiAgICAgICAgICAgICAgICBcImxvZ2luQnV0dG9uXCI6IFwiTG9naW5cIixcbiAgICAgICAgICAgICAgICBcImlucHV0UGxhY2Vob2xkZXJcIjogXCJcIixcbiAgICAgICAgICAgICAgICBcImV4dHJhT3B0aW9uRmVlZGJhY2tcIjogXCJcIixcbiAgICAgICAgICAgICAgICBcImV4dHJhT3B0aW9uc05lZ2F0aXZlRmVlZGJhY2tcIjogXCJOb25lIG9mIHRoZSBhYm92ZVwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJlcnJvclwiOiB7XG4gICAgICAgICAgICAgICAgXCJpbnZhbGlkTG9naW5GaWVsZHNcIjogXCJFcnJvciBpbiBsb2dpbiBmaWVsZHNcIixcbiAgICAgICAgICAgICAgICBcImVtcHR5TG9naW5GaWVsZHNcIjogXCJNaXNzaW5nIHJlcXVpcmVkIGZpZWxkc1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY291bnRyeUNvZGUpIHtcbiAgICAgICAgcmV0dXJuIGxhbmd1YWdlc1tjb3VudHJ5Q29kZV0gfHwgbGFuZ3VhZ2VzLmVuO1xuICAgIH07XG59KCkpOyJdfQ==
