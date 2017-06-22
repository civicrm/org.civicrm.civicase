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
      format: 'int',
      default: 0
    });

    $scope.$bindToRoute({
      param: 'dme',
      expr: 'myCasesOnly',
      format: 'bool',
      default: false
    });
  });

})(angular, CRM.$, CRM._);
