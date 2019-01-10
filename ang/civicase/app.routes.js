(function (angular, $, _) {
  var module = angular.module('civicase');

  module.config(function ($routeProvider) {
    $routeProvider.when('/case/list', {
      reloadOnSearch: false,
      resolve: {
        hiddenFilters: function () {}
      },
      templateUrl: '~/civicase/case/case-list/case-list.html'
    });
  });

  module.config(function ($routeProvider) {
    $routeProvider.when('/case', {
      reloadOnSearch: false,
      controller: 'civicaseDashboardController',
      templateUrl: '~/civicase/dashboard/dashboard.html'
    });
  });

  module.config(function ($routeProvider) {
    $routeProvider.when('/activity/feed', {
      reloadOnSearch: false,
      template: '<div id="bootstrap-theme" class="civicase__container" civicase-activity-feed="{}"></div>'
    });
  });

  module.config(function ($routeProvider) {
    $routeProvider.when('/case/search', {
      reloadOnSearch: false,
      template: '<h1 crm-page-title>{{ ts(\'Find Cases\') }}</h1>' +
      '<div id="bootstrap-theme" class="civicase__container">' +
      '<div class="panel" civicase-search="selections" expanded="true" on-search="show(selectedFilters)">' +
      '</div>' +
      '<pre>{{selections|json}}</pre>' +
      '</div>',
      controller: 'civicaseSearchPageController'
    });
  });
})(angular, CRM.$, CRM._);
