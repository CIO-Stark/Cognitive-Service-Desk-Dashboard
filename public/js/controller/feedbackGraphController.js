var app = angular.module("feedbackGraphModule", ["nvd3", "ngMaterial", "ngMessages"]);

/**
 * formatter for datePickers
 */
app.config(function ($mdDateLocaleProvider) {
	$mdDateLocaleProvider.formatDate = function (date) {
		return dateFormat(date);
	};
});

app.controller('feedbackGraphCtrl', ['$scope', '$rootScope', '$http', 'FeedbackFactory', '$translate',
	function ($scope, $rootScope, $http, FeedbackFactory, $translate) {

		$rootScope.$on('searchButton', function(event, args) {
			if ($rootScope.metricsTab) {
				$scope.search();
			}
		});

		this.$onInit = function () {
			if ($rootScope.bootstraped)
				$scope.search();
		};

		/**
		 * retrieve feedbacks data
		*/
		$scope.search = function() {
			$scope.loading = true;
			FeedbackFactory.findFeedbacksTotal($rootScope.startDate.getTime(), 
                                         $rootScope.endDate.getTime()).then(data => {
				$scope.data = data.data || [];
				$scope.loading = false;
				
				setTimeout(function () {
					$scope.api.update(); 
				});
			}), (err => {
				$scope.data = [];
				console.error(err);
				$scope.loading = false;
			});
		};
        

		$scope.options = {
            chart: {
                type: 'pieChart',
                height: 524,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
								color: ['#00ff00', '#ff0000'],
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                showLegend: false
            }
        };


	}]);

