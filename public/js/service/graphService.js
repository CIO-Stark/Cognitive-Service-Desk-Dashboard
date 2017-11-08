angular.module('graphicSrv', [])

	.factory('GraphicFactory', ['$http',function($http) {
		return {
			platformPieGet : function() {
				return $http.get('/metricsPiePlatform?module=hr_module');
					//then(function(response) {
			           // return response.data;
			        //});
			},
			platformBarGet : function(group, startDate, endDate) {
				return $http.get('/metricsPlatform/' + group + '/' + startDate + '/' + endDate + '?module=hr_module');
			},
			
			userTotalsGet : function(group, startDate, endDate) {
				/**
				 * due to graphic d3 restrictions, for the line the x value must be integer
				 */
				return $http.get('/metricsUsers/' + group + '/' + startDate + '/' + endDate + '?module=access_module');
			},
			
			accuracyBarGet : function(id, startDate, endDate, topAmount) {
				return $http.get('/metricsAccuracy/' + id + '/' + startDate + '/' + endDate + '/' + topAmount + '?module=hr_module');
			},
			
			countryBarGet : function(group, startDate, endDate) {
				return $http.get('/metricsCountry/' + group + '/' + startDate + '/' + endDate + '?module=access_module');
			},
			
			feedbackGet : function(group, startDate, endDate) {
				return $http.get('/metricsFeedback/' + group + '/' + startDate + '/' + endDate + '?module=hr_module');
			},
			
			trackFeedbackGet : function(group, startDate, endDate) {
				return $http.get('/metricsTrackFeedback/' + group + '/' + startDate + '/' + endDate + '?module=hr_module');
			}
		}
	}]);