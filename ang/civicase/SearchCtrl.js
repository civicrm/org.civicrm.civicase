(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/search', {
      template: '<h1 crm-page-title>{{ ts(\'Find Cases\') }}</h1><div id="bootstrap-theme" class="civicase-main"><div class="panel" civicase-search="{}" expanded="true"></div></div>',
      controller: searchPageController
    });
  });

  function searchPageController($scope) {
    var ts = $scope.ts = CRM.ts('civicase');
  }


})(angular, CRM.$, CRM._);
