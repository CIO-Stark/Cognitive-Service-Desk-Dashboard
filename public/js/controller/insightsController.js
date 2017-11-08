var app = angular.module("insightsModule", ["nvd3", "ngMaterial", "ngMessages"]);

app.controller('insightsCtrl', ['$scope', '$rootScope', '$http', 'AdminFactory', '$translate',
	function ($scope, $rootScope, $http, AdminFactory, $translate) {
		var notStartUp = false;
		/**
		 * search button event
		 */
		$rootScope.$on('searchButton', function(event, args) {
			if($rootScope.metricsTab)
				$scope.search();
		});

		this.$onInit = function () {
			if ($rootScope.bootstraped)
				$scope.search();
		};

		
		$scope.search = function(){
			$scope.loading = true;
			notStartUp = false;

			let startDate = $rootScope.startDate.getTime();
			let endDate   = $rootScope.endDate.getTime();
			
			AdminFactory.findAllInsights(startDate, endDate).then(data => {
				$scope.totalQuestions = data.data.totalQuestions;
				$scope.generalConfidence = data.data.generalConfidence;
				
				$scope.totalSessions = data.data.totalSessions;
				$scope.totalFeedbacks = data.data.totalFeedbacks;
				$scope.loading = false;
				
			}), (err => {
				console.error(err);
				$scope.loading = false;
			});
		};

		// execute first time onLoad
		//$scope.search();

		

	}]);

