var app = angular.module("platformGraphModule", ["nvd3", "ngMaterial", "ngMessages"]);

/**
 * formatter for datePickers
 */
app.config(function ($mdDateLocaleProvider) {
	$mdDateLocaleProvider.formatDate = function (date) {
		return dateFormat(date);
	};
});

app.controller('platformGraphCtrl', ['$scope', '$rootScope', '$http', 'AdminFactory', '$translate',
	function ($scope, $rootScope, $http, AdminFactory, $translate) {
        $rootScope.$on('searchButton', function(event, args) {
			if ($rootScope.metricsTab) {
				$scope.search();
			}
		});

		this.$onInit = function () {
			if ($rootScope.bootstraped)
				$scope.search();
		}

        /**
		 * retrieve feedbacks data
		 */
		$scope.search = function() {
			$rootScope.loading = true;
			AdminFactory.findPlatformTotal($rootScope.startDate.getTime(), 
                                               $rootScope.endDate.getTime()).then(data => {
				$scope.data = data.data || [];
				$rootScope.loading = false;
				setTimeout(function () {
					$scope.api.update(); 
				});
			}), (err => {
				$scope.data = [];
				console.error(err);
				$rootScope.loading = false;
			});
		};

		$scope.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
				color: ['#770d66', '#0d6677'],
                showLabels: true,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                showLegend: false
            }
        };

       //$scope.search();


	}]);

