var app = angular.module("intentGraphModule", ["nvd3", "ngMaterial", "ngMessages"]);

/**
 * formatter for datePickers
 */
app.config(function ($mdDateLocaleProvider) {
	$mdDateLocaleProvider.formatDate = function (date) {
		return dateFormat(date);
	};
});

app.controller('intentGraphCtrl', ['$scope', '$rootScope', '$document', '$http', 'AdminFactory', '$translate',
	function ($scope, $rootScope, $document, $http, AdminFactory, $translate) {
		$scope.loading = {
			inMetrics: false,
			inInsights: false
		};
		$rootScope.selectedIntent = "";

		/**
		 * search button event
		 */
		$rootScope.$on('searchButton', function(event, args) {
			if ($rootScope.metricsTab || $rootScope.insightsTab) {
				$scope.search();
			}
		});

		this.$onInit = function () {
			if ($rootScope.bootstraped)
				$scope.search();
			
		};

		/**
		 * get list of intents -> dropdown
		 */
		$scope.intentDropDownLoading = true;
		if(!$scope.intentList || !$scope.intentList.length)
			AdminFactory.findAllIntents($rootScope.startDate.getTime(), $rootScope.endDate.getTime()).then(data => {
					$scope.intentList = data.data || [];
					$scope.intentDropDownLoading = false;				
				}), (err => {
					$scope.intentList = [];
					console.error(err);
					$scope.intentDropDownLoading = false;			
							
				});

		/**
		 * update filter data after watched changes
		 */
		$scope.search = function() {
			// $scope.loading = true;

			/**
			 * get the mult chart that presents intents bars and line feedbacks
			 * IT exists inly in the metricsTab
			 */
			if($rootScope.metricsTab) {
				$scope.loading.inMetrics = true;
				AdminFactory.findIntentsAndFeedbacks($scope.dropdownIntent || '-', 
													$rootScope.startDate.getTime(), 
													$rootScope.endDate.getTime()).then(data => {
					$scope.data = data.data || [];
					$scope.loading.inMetrics = false;
					setTimeout(function () {
						$scope.api.update(); 
					});
				}), (err => {
					$scope.data = [];
					console.error(err);
					$scope.loading.inMetrics = false;
				});
			}

			/**
			 * get data for the overall intents graphic
			 * It exists only in the insightsTab
			 */
			if($rootScope.insightsTab) {
				$scope.loading.inInsights = true;
				AdminFactory.findTopIntentsData($rootScope.startDate.getTime(), 
												$rootScope.endDate.getTime(), 5).then(data => {
					$scope.dataOverall = data.data || [];
					$scope.loading.inInsights = false;
					setTimeout(function () {
						if($scope.overallApi)
							$scope.overallApi.update(); 
					});
				}), (err => {
					$scope.data = [];
					console.error(err);
					$scope.loading.inInsights = false;
				});
			}
				
			
		};


		$scope.exportData = function () {
			var blob = new Blob([document.getElementById('intentDetailExportable').innerHTML], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
			});
        	saveAs(blob, "Report.xls");
    	};


		/**
		 * intents drop down updates
		 */
		$scope.updateIntent = function(intent) {
			$scope.search();
		};

		/**
		 * changed intent dropdown for wordcloud
		 */
		$scope.updateWordCloudIntent = function() {
			$scope.wcLoading = true;
			var queryResult = $document[0].getElementById('wcCanvas');
			
			if(queryResult != null){
				//var mock = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam expedita, architecto obcaecati id numquam repellat dolores similique atque error quod sit, ex dolore, et laborum iusto ipsa accusantium. Ut, maxime.".replace(/(,|\.)/g,'').split(' ').map(function (word) { return [word, 3] });

				//WordCloud(queryResult, { list: [['foo', 120], ['foo', 45],['bar', 60]] } );
				AdminFactory.findWordCloudData($scope.dropdownWordCloudIntent,
												$rootScope.startDate.getTime(),
												$rootScope.endDate.getTime()).then(data => {
					$scope.wordClouddata = data.data.data || [];
					//$scope.wordClouddata = $scope.wordClouddata.concat(mock);
					WordCloud(queryResult, { 
						list: $scope.wordClouddata, 
						weightFactor: function (size) {
							//if (size < 5) {
								//return 0
							//} else {
								return size * 15
							//}
						}
					});
					$scope.wcLoading = false;
				}), (err => {
					$scope.wordClouddata = [];
					console.error(err);
					$scope.wcLoading = false;
				});
			}
				
				
		};


		

		/**
		 * update graphic selected intention and present its access report
		 */
		$scope.updateSelectedValue = function(intent) {
			$scope.intentReportData = null;
			$rootScope.loading = true;
			$scope.loadingIntent = true;
			AdminFactory.findIntentReport(intent, $rootScope.startDate.getTime(), $rootScope.endDate.getTime()).then(data => {
				$scope.intentReportData = data.data || [];
				$rootScope.loading = false;
				$scope.loadingIntent = false;
			}), (err => {
				$scope.intentReportData = [];
				console.error(err);
				$rootScope.loading = false;
				$scope.loadingIntent = false;
			});
			
			$scope.$digest();


			
		};
		

		// intention / feedbacks graphic
		$scope.options = {
            chart: {
                type: 'multiChart',
                height: 450,
                margin : {
                    top: 30,
                    right: 60,
                    bottom: 50,
                    left: 70
                },"noData": "Não existem dados para a pesquisa",
		lines1: {
			/*dispatch: {
			elementClick: function(e){ console.log('click') },
			elementMouseover: function(e){ console.log('mouseover') },
			elementMouseout: function(e){ console.log('mouseout') },
			renderEnd: function(e){ console.log('renderEnd') }
			}*/
		},
		bars1: {
			dispatch: {
				elementClick: function(e){ 
					$scope.selectedIntent = e.data.label;
					$scope.updateSelectedValue($scope.selectedIntent);

				},
			//elementMouseover: function(e){ console.log('mouseover') },
			//elementMouseout: function(e){ console.log('mouseout') },
			//renderEnd: function(e){ console.log('renderEnd') }
			},"forceY": [
        		0
      		],
		},
                "color": [
                  "#004c26",
                  "#FF0000",
                  "#E6EAE3"],
                //useInteractiveGuideline: true,
                duration: 500,
				showLegend: false,
                 /*x: function(d, i){
					 console.log('x', d, i);
			      if(d.hasOwnProperty("label"))
				  	if(d.series == 0) return d.label;
                 	else return d.x;
                 },*/
                xAxis: {
                    axisLabel: 'Intenções',
                    tickFormat: function(d){
                        return d;
                    }
                },
                yAxis1: {
                  axisLabel: 'Acuracia',
                    tickFormat: function(d){
                      return d3.format('.0%')(d);
					}
                },
                yAxis2: {
                    tickFormat: function(d){
                        return d3.format(',')(d);
                    }
                },
				tooltip: {
                contentGenerator: function (e) {
                  var series = e.series[0];
                  if (series.value === null) return;
                  //console.log('tooltip', e);
				  var intent, value;
				  intent = e.hasOwnProperty("point") ? e.point.label : e.data.label;
				  value = e.hasOwnProperty("point") ? e.point.y : e.data.y * 100;
                  var header = 
                    "<thead>" + 
                      "<tr>" +
                        "<td class='legend-color-guide'><div style='background-color: " + series.color + ";'></div></td>" +
                        "<td class='key'><strong>" + series.key + "</strong></td>" +
                      "</tr>" + 
                    "</thead>";
				  
				  var rows = 
                    "<tr>" +
                      "<td class='key'>" + 'Intenção: ' + "</td>" +
                      "<td class='x-value'>" + intent +"</td>" + 
                    "</tr>" + 
					"<tr>" +
                      "<td class='key'>" + 'Valor: ' + "</td>" +
                      "<td class='x-value'>" + value +"</td>" + 
                    "</tr>";

                  return "<table>" +
                      header +
                      "<tbody>" + 
                        rows + 
                      "</tbody>" +
                    "</table>";
                } 
              }
            }
        };

		$scope.optionsOverall = {
            chart: {
                type: 'multiBarChart',
                height: 450,
                margin : {
                    top: 30,
                    right: 20,
                    bottom: 45,
                    left: 45
                },
				"noData": "Não existem dados para a pesquisa",
                clipEdge: true,
                duration: 500,
                stacked: true,
				"showLegend": false,
				x: function(d, i){
					 //console.log('x', d, i);
			      return '';
                 },
                xAxis: {
					"width": 75,
                    axisLabel: 'Intenção',
                    showMaxMin: false,
                    tickFormat: function(d){
                        return d;
                    }
                },
                yAxis: {
                    axisLabel: 'Total',
                    axisLabelDistance: -20,
                    tickFormat: function(d){
                        return d3.format(',.1f')(d);
                    }
                }
            }
        };
			

	}]);

