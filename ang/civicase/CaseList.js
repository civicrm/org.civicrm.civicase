(function (angular, $, _) {
  var module = angular.module('civicase');

  module.config(function ($routeProvider) {
    $routeProvider.when('/case/list', {
      reloadOnSearch: false,
      resolve: {
        hiddenFilters: function () {}
      },
      templateUrl: '~/civicase/CaseList.html'
    });
  });
})(angular, CRM.$, CRM._);
