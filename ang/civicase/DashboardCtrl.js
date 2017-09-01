(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
      $routeProvider.when('/case', {
        reloadOnSearch: false,
        controller: 'CivicaseDashboardCtrl',
        templateUrl: '~/civicase/DashboardCtrl.html'
      });
    }
  );

  angular.module('civicase').controller('CivicaseDashboardCtrl', function($scope, crmApi, formatActivity) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.caseStatuses = CRM.civicase.caseStatuses;
    $scope.caseTypes = CRM.civicase.caseTypes;

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

    $scope.$bindToRoute({
      param: 'dbd',
      expr: 'showBreakdown',
      format: 'bool',
      default: false
    });

    $scope.summaryData = [];

    $scope.dashboardActivities = {
      recentCommunication: [],
      nextMilestones: []
    };

    $scope.showHideBreakdown = function() {
      $scope.showBreakdown = !$scope.showBreakdown;
    };

    $scope.refresh = function(apiCalls) {
      apiCalls = apiCalls || [];
      apiCalls.push(['Case', 'getstats', {my_cases: $scope.myCasesOnly}]);
      var params = _.extend({
        sequential: 1,
        is_current_revision: 1,
        is_test: 0,
        options: {limit: 10, sort: 'activity_date_time DESC'},
        return: ['case_id', 'activity_type_id', 'subject', 'activity_date_time', 'status_id', 'target_contact_name', 'assignee_contact_name', 'is_overdue']
      }, $scope.activityFilters);
      // recent communication
      apiCalls.push(['Activity', 'get', _.extend({
        "activity_type_id.grouping": {LIKE: "%communication%"},
        'status_id.filter': 1,
        options: {limit: 10, sort: 'activity_date_time DESC'}
      }, params)]);
      // next milestones
      apiCalls.push(['Activity', 'get', _.extend({
        "activity_type_id.grouping": {LIKE: "%milestone%"},
        'status_id.filter': 0,
        options: {limit: 10, sort: 'activity_date_time ASC'}
      }, params)]);
      crmApi(apiCalls).then(function(data) {
        $scope.summaryData = data[apiCalls.length - 3].values;
        $scope.dashboardActivities.recentCommunication = _.each(data[apiCalls.length - 2].values, formatActivity);
        $scope.dashboardActivities.nextMilestones = _.each(data[apiCalls.length - 1].values, formatActivity);
      });
    };

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
      $scope.refresh();
    });
  });

})(angular, CRM.$, CRM._);
