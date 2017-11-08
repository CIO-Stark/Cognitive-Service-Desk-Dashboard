angular.module('adminSrv', [])

	.factory('AdminFactory', ['$http', '$q', function ($http, $q) {
		return {
			/**
			 * total number of questions made
			 */
			totalQuestions: function () {
				var def = $q.defer();
				$http.get('/adminMetrics/totalQuestions').then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail to get totalQuestions');
					});
				return def.promise;

			},
			totalRelevance: function () {
				var def = $q.defer();
				$http.get('/adminMetrics/totalRelevance').then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail to get totalRelevance');
					});
				return def.promise;

			},
			totalAccess: function () {
				var def = $q.defer();
				$http.get('/adminMetrics/totalAccess').then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail to get totalAccess');
					});
				return def.promise;

			},
			findIntentsAndFeedbacks: function (intent, startDate, endDate) {
				var def = $q.defer();
				$http.get('/adminMetrics/intentsAndFeedbacks/' + intent + '/' + startDate + '/' + endDate).then(data => {
						
						def.resolve(data);
					}), (err => {
						def.reject('fail findIntentsAndFeedbacks');
					});
				return def.promise;

			},
			findIntentReport: function (intent, startDate, endDate) {
				var def = $q.defer();
				$http.get('/adminMetrics/intentsReport/' + intent + '/' + startDate + '/' + endDate).then(data => {
						
						def.resolve(data);
					}), (err => {
						def.reject('fail findIntentReport');
					});
				return def.promise;

			},
			findAllIntents: function (startDate, endDate) {
				var def = $q.defer();
				$http.get('/adminMetrics/findAllIntents/' + startDate + '/' + endDate).then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail findAllIntents');
					});
				return def.promise;

			},
			findWordCloudData: function (intent, startDate, endDate) {
				var def = $q.defer();
				$http.get('/adminMetrics/wordcloud/' + intent + '/' + startDate + '/' + endDate).then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail findWordCloudData');
					});
				return def.promise;

			},
			findTopIntentsData: function (startDate, endDate, limit) {
				var def = $q.defer();
				$http.get('/metrics/topIntents/' + startDate + '/' + endDate + '/'+ limit).then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail findTopIntentsData');
					});
				return def.promise;

			},
			findAllInsights: function (startDate, endDate) {
				var def = $q.defer();
				$http.get('/adminMetrics/allInsights/' + startDate + '/' + endDate).then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail findAllInsights');
					});
				return def.promise;

			},
			findPlatformTotal: function (startDate, endDate) {
				var def = $q.defer();
				$http.get('/adminMetrics/findPlatformTotal/' + startDate + '/' + endDate).then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail findAllInsights');
					});
				return def.promise;

			}

		}
	}]);