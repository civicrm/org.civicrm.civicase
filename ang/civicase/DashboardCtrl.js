(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
      $routeProvider.when('/case', {
        reloadOnSearch: false,
        controller: 'CivicaseDashboardCtrl',
        templateUrl: '~/civicase/DashboardCtrl.html'
      });
    }
  );

  angular.module('civicase').controller('CivicaseDashboardCtrl', function($scope, crmApi, crmStatus) {
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

    // Translate between the dashboard's global filter-options and
    // the narrower, per-section filter-options.
    $scope.$watch('myCasesOnly', function (myCasesOnly) {
      if (myCasesOnly) {
        $scope.activityFilters = {
          case_filter: {case_manager: CRM.config.user_contact_id}
        };
      }
      else {
        $scope.activityFilters = {case_id: {'IS NOT NULL': 1}};
      }
    });
  });

})(angular, CRM.$, CRM._);
