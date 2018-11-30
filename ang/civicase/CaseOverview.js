(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseOverview', function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '~/civicase/CaseOverview.html',
      controller: civicaseCaseOverviewController,
      scope: {},
      link: civicaseCaseOverviewLink
    };

    /**
     * Link function for civicaseCaseOverview
     *
     * @param {Object} $scope
     * @param {jQuery} element
     * @param {Object} attrs
     */
    function civicaseCaseOverviewLink ($scope, element, attrs) {
      (function init () {
        $scope.$watch('showBreakdown', recalculateScrollbarPosition);
      }());

      /**
       * Watchers for showBreakdown variable
       */
      function recalculateScrollbarPosition () {
        $scope.$emit('civicase::custom-scrollbar::recalculate');
      }
    }
  });

  module.controller('civicaseCaseOverviewController', civicaseCaseOverviewController);

  /**
   * Controller for civicaseCaseOverview
   *
   * @param {Object} $scope
   * @param {crmApi} Object
   */
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
     * Checks if all statuses are disabled
     *
     * @return {Boolean}
     */
    $scope.isAllStatusesDisbabled = function () {
      return _.filter($scope.caseStatuses, function (status) {
        return !status.disabled;
      }).length === 0;
    };

    /**
     * Toggle show breakdown dropdown
     */
    $scope.showHideBreakdown = function () {
      $scope.showBreakdown = !$scope.showBreakdown;
    };

    /**
     * Toggle status view
     *
     * @param {event} event object
     * @param {Number} index of the case status
     */
    $scope.toggleStatusView = function ($event, index) {
      $scope.caseStatuses[index + 1].disabled = !$scope.caseStatuses[index + 1].disabled;
      $event.stopPropagation();
    };

    /**
     * Toggles the visibility of the breakdown dropdown
     */
    $scope.toggleBrekdownVisibility = function () {
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
})(angular, CRM.$, CRM._);
