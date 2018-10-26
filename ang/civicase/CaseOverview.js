(function (angular, $, _) {
  var module = angular.module('civicase');
  // Todo: To write unit tests
  module.directive('civicaseCaseOverview', function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '~/civicase/CaseOverview.html',
      controller: civicaseCaseOverviewController,
      scope: {}
    };

    function civicaseCaseOverviewController ($scope, crmApi) {
      $scope.caseStatuses = CRM.civicase.caseStatuses;
      $scope.caseTypes = CRM.civicase.caseTypes;
      $scope.caseTypesLength = _.size(CRM.civicase.caseTypes);
      $scope.summaryData = [];

      (function init () {
        // We hide the breakdown when there's only one case type
        if ($scope.caseTypesLength < 2) {
          $scope.showBreakdown = false;
        }

        loadStatsData();
      }());

      /**
       * Creates link to the filtered cases list
       *
       * @param {String} type
       * @param {String} status
       * @return {String} link to the filtered list of cases
       */
      $scope.caseListLink = function (type, status) {
        var cf = {};

        if (type) {
          cf.case_type_id = [type];
        }

        if (status) {
          cf.status_id = [status];
        }

        if ($scope.myCasesOnly) {
          cf.case_manager = [CRM.config.user_contact_id];
        }

        return '#/case/list?' + $.param({cf: JSON.stringify(cf)});
      };

      /**
       * Toggle show breakdown dropdown
       */
      $scope.showHideBreakdown = function () {
        $scope.showBreakdown = !$scope.showBreakdown;
      };

      /**
       * Loads Stats data
       */
      function loadStatsData () {
        var apiCalls = [];

        apiCalls.push(['Case', 'getstats', {}]);
        crmApi(apiCalls).then(function (response) {
          $scope.summaryData = response[0].values;
        });
      }
    }
  });
})(angular, CRM.$, CRM._);
