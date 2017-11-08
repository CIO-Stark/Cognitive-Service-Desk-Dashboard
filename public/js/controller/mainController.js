var app = angular.module("myApp", ["ngRoute", "components", "nvd3",
	"graphModule", "graphicSrv", "pascalprecht.translate", "adminModule", 
	"adminSrv", "intentGraphModule",
	"platformGraphModule", "feedbackGraphModule", "feedbackSrv",
	"insightsModule"]);
//, "pascalprecht.translate"

/*app.config(function ($translateProvider) {
    $translateProvider.useMissingTranslationHandlerLog();
    
    $translateProvider.useStaticFilesLoader({
        prefix: 'resources/locale-',// path to translations files
        suffix: '.json'// suffix, currently- extension of the translations
    });
    $translateProvider.preferredLanguage('en_US');// is applied on first load
    $translateProvider.useLocalStorage();// saves selected language to localStorage
    
    
    $translateProvider.translations('en', translations).preferredLanguage('en');
});*/

app.factory('mainService', function (GraphicFactory) {
	return {
		test: {
			x: 100
		},
		updateChart: function (level, startTime, endTime, callback) {
			var grp;
			if (level == 2)
				grp = 'grpDay';
			else if (level == 3)
				grp = 'grpWeek';
			else
				grp = 'grpMonth';

			GraphicFactory.trackFeedbackGet(grp, startTime, endTime).then(
				function (response) {
					callback(null, response.data);
				}, function (error) {
					callback(error.message, []);
				});
		}
	};
});

app.config(function ($translateProvider) {
	$translateProvider.translations('en', {
		'MAIN.TITLE': 'SME Board',
		FOO: 'This is a paragraph.',
		BUTTON_LANG_EN: 'english',
		BUTTON_LANG_DE: 'german'
	});
	$translateProvider.translations('pt_BR', {
		'MAIN.TITLE': 'SME Board',
		'MAIN.FILTER.DAILY': 'Diário', 'MAIN.FILTER.WEEKLY': 'Semanal', 'MAIN.FILTER.MONTHLY': 'Mensal',
		'MAIN.FILTER.ACTION': 'Procurar',
		'MAIN.FILTER': 'Filtro',
		'MAIN.FILTER.ACTION': 'Filtrar',
		'MAIN.TAB.METRICS': 'Métricas', 'MAIN.TAB.TRAINING': 'Revisão',
		'GRAPHICS.SME': 'Revisão do SME',
		'GRAPHICS.ACCURACY': 'Acuracidade das intencões do Watson',
		'GRAPHICS.USERS': 'Usuários',
		'GRAPHICS.LOCATION': 'Localizacão',
		'GRAPHICS.PLATFORM': 'Navegador',
		'GRAPHICS.SMEBOARD': 'Acões do SME',
		'GRAPHICS.AXIS.BROWSER': 'Navegador',
		'GRAPHICS.AXIS.ACESS': 'Acessos',
		'GRAPHICS.AXIS.USER': 'Usuários',
		'GRAPHICS.AXIS.DATE': 'Data',
		'GRAPHICS.AXIS.WEEK': 'Semana',
		'SMEBOARD.SAVING': 'Salvando...',
		'SMEBOARD.TABLE.USER': 'Usuário',
		'SMEBOARD.TABLE.QUESTIONS': 'Perguntas',
		'SMEBOARD.TABLE.FEEDBACK': 'Feedback',
		'SMEBOARD.TABLE.ENTITY': 'Entidade',
		'SMEBOARD.TABLE.TOPIC': 'Tópico',
		'SMEBOARD.TABLE.DATE': 'Data',
		'SMEBOARD.SAVING': 'Salvando...',
		'SMEBOARD.TRACKING.TRAINED': 'Intencões treinadas',
		'SMEBOARD.TRACKING.DIALOG': 'Diálogos atualizados',
		'SMEBOARD.TRACKING.USER_ERROR': 'Erro de usuário',
		'SMEBOARD.TRACKING.NO_ISSUE': 'Não é problema',
		BUTTON_LANG_DE: 'deutsch'
	});
	$translateProvider.preferredLanguage('pt_BR');

	// Logo animation
	var bannerLogo = document.getElementById('sp-logo');
	var navbarLogo = document.getElementById('navbar-sp-logo');
	var flag = true;

	$(window).scroll(function(event){
		if($(window).scrollTop() > ($(bannerLogo).height())){
			$(bannerLogo).addClass("inactive");
		}
		else{
			$(bannerLogo).removeClass("inactive");
		}
	});

/*
	document.addEventListener('scroll', function () {
		var elemTop = bannerLogo.getBoundingClientRect().top;
    var elemBottom = bannerLogo.getBoundingClientRect().bottom;
		var scrolled = window.scrollHeight;
		console.log(scrolled, scrolled > bannerLogo.height);

		if ((elemTop >= 0) && (elemBottom <= window.innerHeight) && flag) { // logo do banner fora da visão
			bannerLogo.classList.remove('inactive');
			console.log(elemTop, elemBottom);
		} else  {
			bannerLogo.classList.add('inactive');
			console.log(elemTop, elemBottom);
		}
	});
	*/
});

app.constant('LOCALES', {
	'locales': {
		'pt_BR': 'Portugues',
		'en_US': 'English'
	},
	'preferredLocale': 'en_US'
})


app.config(function ($routeProvider) {
	$routeProvider
		.when("/teste", {
			templateUrl: "pages/watsonAccuracy.html",
			controller: "aboutController"
		});
});


/**
 * controller for smeBoard, list with the feedbacks
 */
app.controller('boardCtrl', ['$scope', '$rootScope', 'FeedbackFactory', '$translate', 'mainService',
	function ($scope, $rootScope, FeedbackFactory, $translate, mainService) {
		$scope.smeLoading = false;
		$scope.sortType = 'feedbackDate';
		$scope.sortReverse = false;  // default sort order
		$scope.searchIT = '';

		//$scope.feed = {};

		$rootScope.$on('searchButton', function(event, args) {
			/**
			 * if sme tab is selected and search button pressed, then update
			 */
			if($rootScope.smeTab)
				$scope.searchSMEReport();
		});

		this.$onInit = function () {
			if ($rootScope.bootstraped)
				$scope.searchSMEReport();
		};


		/**
		 * get list of all feedbacks
		 */
		$scope.searchSMEReport = function () {
			$scope.smeLoading = true;
			var start = $rootScope.startDate.getTime();
			var end = $rootScope.endDate.getTime();
			FeedbackFactory.listAll(start, end).then(
				function (response) {
					$scope.feedbackData = response.data;
					$scope.smeLoading = false;
				}, function (error) {
					$scope.data = [];
					console.error('Unable to load feedback data: ' + error.message);
					$scope.smeLoading = false;
				});
		};

		//$scope.searchSMEReport();


		/**
		 * updates to the sme tracking drop downs
		 */
		$scope.updateTraining = function (id, value) {
			//id = event.target.id;
			//console.log($scope.feedbackData.selected);
			//$scope.message = $scope.feedbackData.selected;
			//$scope.message = $scope.feed.feedbackTracking;


			$scope.feedbackData.loading = true;

			FeedbackFactory.trackFeedbacks(id, Number(value)).then(
				function (response) {
					$scope.feedbackData = response.data;
					$scope.feedbackData.loading = false;


					mainService.updateChart($rootScope.selection, $rootScope.startDateSME.getTime(), $rootScope.endDateSME.getTime(),
						function (err, data) {
							if (!err) {
								$rootScope.dataTrackFeedback = data;
								console.log(data);
							}
						});


				}, function (error) {
					$scope.data = [];
					console.error('Unable to load feedback data: ' + error.message);
					$scope.feedbackData.loading = false;
				});
		};

		$scope.exportData = function () {
			var blob = new Blob([document.getElementById('smeBoardExportable').innerHTML], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
			});
        	saveAs(blob, "SMEReport.xls");
    	};


	}]);

/**
 * controller for smeBoard
 */
app.controller('boardCtrlGraph', ['$scope', '$rootScope', 'GraphicFactory', 'mainService', '$translate',
	function ($scope, $rootScope, GraphicFactory, mainService, $translate) {
		$rootScope.startDateSME = new Date();
		$rootScope.startDateSME.setHours(0, 0, 0, 0);
		$rootScope.endDateSME = new Date();
		$rootScope.endDateSME.setHours(23, 59, 59, 0);
		// daily - default
		$rootScope.selection = 2;


		$scope.optionsTrackFeedback = angular.copy($scope.optionsAccuracy); //options Accuracy on graphController
		$scope.changeLanguage = function (key) {
			$translate.use(key);
		};

		console.log($translate);
		$scope.optionsTrackFeedback.title.text = $translate.instant('GRAPHICS.SMEBOARD');//'SME Review status';
		$scope.optionsTrackFeedback.chart.height = 150;
		$scope.optionsTrackFeedback.chart.margin.top = 25;
		$scope.optionsTrackFeedback.chart.margin.right = 5;
		$scope.optionsTrackFeedback.chart.margin.botton = 55;
		$scope.optionsTrackFeedback.chart.margin.left = 20;
		$scope.optionsTrackFeedback.chart.yAxis.tickFormat = function (d) { return d3.format(',.1f')(d); };


		/**
		 * triggered with search button
		 */
		$scope.searchSME = function (level) {
			if (level) $rootScope.selection = level;
			else level = 2;
			mainService.updateChart(level, $rootScope.startDateSME.getTime(), $rootScope.endDateSME.getTime(), function (err, data) {
				if (!err) {
					$rootScope.dataTrackFeedback = data;
					console.log(data);
				}
			});

		};
		/*$rootScope.searchSME = function(level) {
		    if(level) $scope.selection = level;
	    	
		      var grp;
		      var start = $scope.startDate.getTime();
		      var end = $scope.endDate.getTime();
		      if($scope.selection == 2)
			      grp = 'grpDay';
		      else if($scope.selection == 3)
			      grp = 'grpWeek';
		      else
			      grp = 'grpMonth';
		      
		      GraphicFactory.trackFeedbackGet(grp, start, end).then(
				    function (response) {
					    $scope.dataTrackFeedback = response.data;
				    }, function (error) {
					    $scope.dataTrackFeedback = [];
					    console.error('Unable to load customer data: ' + error.message);
		    });
	    }*/

	}]);