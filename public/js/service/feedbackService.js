angular.module('feedbackSrv', [])

	.factory('FeedbackFactory', ['$http','$q', function($http, $q) {
		return {
			listAll : function(start, end) {
				return $http.get('/listFeedback/' + start + '/' + end);
			},
			
			trackFeedbacks : function(id, status) {
				return $http.post('/updateFeedback?id=' + id + '&status=' + status + '&module=hr_module');
			},
			findFeedbacksTotal: function (startDate, endDate) {
				var def = $q.defer();
				$http.get('/findFeedbacksTotal/' + startDate + '/' + endDate).then(data => {
						def.resolve(data);
					}), (err => {
						def.reject('fail findFeedbacksTotal');
					});
				return def.promise;

			}
		}
	}]);