(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
      $routeProvider.when('/case', {
        reloadOnSearch: false,
        controller: 'CivicaseDashboardCtrl',
        templateUrl: '~/civicase/DashboardCtrl.html'
      });
    }
  );

  angular.module('civicase').controller('CivicaseDashboardCtrl', function($scope) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.$bindToRoute({
      param: 'dtab',
      expr: 'activeTab',
      format: 'json',
      default: 0
    });

    $scope.$bindToRoute({
      param: 'dme',
      expr: 'myCasesOnly',
      format: 'json',
      default: 0
    });
  });

})(angular, CRM.$, CRM._);
