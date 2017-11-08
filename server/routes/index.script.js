/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";

    var loginRoutes = require("./partials/loginHandler"),
        docRoutes = require("./partials/docHandler"),
        feedbackRoutes = require("./partials/feedbackHandler"),
        watsonRoutes = require("./partials/watsonHandler"),
        metricRoutes = require("./partials/metricsHandler"),
        adminRoutes = require("./partials/adminHandler"),
        isLoggedIn = function (req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            } else {
                return res.status(401).send("Not authorized to use this resource");
            }
        };

    module.exports = function (app, passport, cloudantFeedbackFactory, cloudantUsersFactory) {
        loginRoutes(app, passport, isLoggedIn);
        feedbackRoutes(app, cloudantFeedbackFactory);
        metricRoutes(app, cloudantFeedbackFactory, cloudantUsersFactory);
        adminRoutes(app, cloudantFeedbackFactory);
        
        // Initialize Passport and restore authentication state, if any, from the
        // session.
        app.use(passport.initialize());
        app.use(passport.session());

        app.get("/", function (req, res) {
            return res.status(200).render("login.html", {
                user: req.user || ""
            });
        });
        
        app.get("/login", function (req, res) {
            return res.status(200).render("login.html", {
                user: req.user || ""
            });
        });
        
        app.post('/login', 
        		passport.authenticate('local', { failureRedirect: '/login' }),
        			function(req, res) {
		    			res.redirect('/main');
		});
        
        app.get('/logout',
        		  function(req, res){
        		    req.logout();
        		    res.redirect('/login');
        		  });
        
        
        app.get("/dashboard", 
        		require('connect-ensure-login').ensureLoggedIn(),
        		  function(req, res) {
        			return res.status(200).render("metricsDashboard.html");
        });

        app.get("/main", 
        		require('connect-ensure-login').ensureLoggedIn(),
        		  function(req, res) {
        			return res.status(200).render("main.html");
        });
        
        		
        		
    };

}());