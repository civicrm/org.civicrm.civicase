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

    // @return Promise<Array<int>>
    function getMyCaseIds() {
      return crmApi('Case', 'getdetails', {
        is_deleted: 0,
        options: {
          offset: 0,
          limit: 0
        },
        return: ['id'],
        case_manager: {'IN': [CRM.config.user_contact_id]}
      }).then(function(r){
        return _.collect(r.values, 'id');
      });
    }

    // Translate between the dashboard's global filter-options and
    // the narrower, per-section filter-options.
    $scope.$watch('myCasesOnly', function (myCasesOnly) {
      if (myCasesOnly) {
        // Hmm, this might be a good idea, but none of CiviCase UI does it: crmStatus(ts('Refreshing'), ...);
        getMyCaseIds().then(function (caseIds) {
          $scope.activityFilters = {case_id: {'IN': caseIds}};
        })
      }
      else {
        $scope.activityFilters = {case_id: {'IS NOT NULL': 1}};
      }
    });
  });

})(angular, CRM.$, CRM._);
