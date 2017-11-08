var app = angular.module("graphModule", ["nvd3", "ngMaterial", "ngMessages"]);

// dummy
app.factory('theService', function() {  
	return {
		thing : {
			x : 100
		}
	};
});

/**
 * formatter for datePickers
 */
app.config(function($mdDateLocaleProvider) {
			  $mdDateLocaleProvider.formatDate = function(date) {
			    return dateFormat(date);
			  };
});
		
app.controller('graphCtrl', ['$scope', '$rootScope', '$http', 'GraphicFactory', '$translate', 
						function($scope, $rootScope, $http, GraphicFactory, $translate) {

			/**
			 * search button event
			 */
			$rootScope.$on('searchButton', function(event, args) {
				if($rootScope.insightsTab)
					$scope.search();
			});

			this.$onInit = function () {
				// set default dropdown topIntentions
				$scope.dropdownTopIntentions = {
					"value": 5, 
					"values": [ 5, 10, 15, 20] 
				};

				if ($rootScope.bootstraped)
					$scope.search();
			};

			// daily - default
			$scope.selection = 2;
			$scope.intentionLoading = false;

			$scope.updateTopIntentionsFilter = function() {
				console.log($scope.selection);
				console.log($scope.dropdownTopIntentions.value);
				$scope.search($scope.selection);
			};
		  
			
			$scope.search = function(level) {
				if(level) $scope.selection = level;
					$scope.intentionLoading = true;
				  var grp;
				  var start = $rootScope.startDate.getTime();
				  var end = $rootScope.endDate.getTime();
				  if($scope.selection == 2)
					  grp = 'grpDay';
				  else if($scope.selection == 3)
					  grp = 'grpWeek';
				  else
					  grp = 'grpMonth';
					  //if(start == end)
						  //$scope.startDate.setMonth($scope.startDate.getMonth() + 1)
				  
				  GraphicFactory.accuracyBarGet(grp, start, end, $scope.dropdownTopIntentions.value || 5).then(
			    		function (response) {
			    			$scope.dataAccuracy = response.data;
								$scope.intentionLoading = false;
								setTimeout(function () {
									 $scope.accuracyApi.update();
								});
			    		}, function (error) {
			    			$scope.data = [];
								$scope.intentionLoading = false;
			    			console.error('Unable to load customer data: ' + error.message);
			        });
				  
				  
				  
				/*  GraphicFactory.platformBarGet(grp, start, end).then(
			    		function (response) {
			    			$scope.dataPlatform = response.data;
			    		}, function (error) {
			    			$scope.dataPlatform = [];
			    			console.error('Unable to load platform data: ' + error.message);
			        });*/
			}
			
			  $scope.optionsAccuracy = {
			            chart: {
			                type: 'multiBarChart',
			                height: 350,
											"noData": "Não existem dados para a pesquisa",
			                clipEdge: true,
			                duration: 500,
			                stacked: true,
			                showControls: false,
			                xAxis: {
			                    axisLabel: 'Intenção',
			                    showMaxMin: true,
			                    tickFormat: function(d) {
			    	              	/**
			    	              	 * depending on the filter, will show the right values on x
			    	              	 */
			    	              	var monthNameFormat = d3.time.format('%Y/%m/%d');
			    	              	
			    	              	if($scope.selection == 4){ //month
			    	              		monthNameFormat = d3.time.format('%Y/%m');
			    	              	}else if($scope.selection == 3)
			    	              		return "Year:" + new Date(Number(d)).getFullYear() + 
			    	              				" Week: " + d3.time.mondayOfYear(new Date(Number(d)));
			    	              	
			    	              	return monthNameFormat(new Date(Number(d)));
			    	              }
			                },
			                yAxis: {
			                    axisLabel: 'Total',
			                    axisLabelDistance: -20,
			                    tickFormat: function(d){
			                        //return d3.format(',%')(d);
						return d;
			                    }
			                }
			            },
			            styles: {
			                classes: {
			                  "with-3d-shadow": true,
			                  "with-transitions": true,
			                  "gallery": false,
							  "is-fullwidth": true
			                }
			            },
			            css: {},
			            title: {
			                enable: true,
			                text: ''//$translate.instant('GRAPHICS.ACCURACY')
			            }
			        };
			  
			  /**
			   * Platform Bar chart
			   */
			  $scope.optionsPlatformBar = angular.copy($scope.optionsAccuracy);
			  $scope.optionsPlatformBar.title.text = $translate.instant('GRAPHICS.PLATFORM');
			  $scope.optionsPlatformBar.chart.xAxis.axisLabel = $translate.instant('GRAPHICS.AXIS.BROWSER');
			  $scope.optionsPlatformBar.chart.xAxis.tickFormat = $scope.optionsAccuracy.chart.xAxis.tickFormat;
			  $scope.optionsPlatformBar.chart.yAxis.axisLabel = $translate.instant('GRAPHICS.AXIS.ACCESS');
			  $scope.optionsPlatformBar.chart.yAxis.tickFormat = function(d){ return d3.format(',.1f')(d);};
				  
			  

}]);	

	/**
	 * returns date format yyyy-mm-dd for the charts label
	 * @param date
	 * @returns
	 */
	function dateFormat(date){
		var day = date.getDate();
		day = day < 10 ? '0'+ day : day;
		
		var monthIndex = date.getMonth();
		monthIndex = (monthIndex + 1) < 10 ? '0'+(monthIndex +1) : (monthIndex +1);
		
		var year = date.getFullYear();
		
		return year + '-' + monthIndex + '-' + day;
	}