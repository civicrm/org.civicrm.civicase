(function (angular, $) {
  var module = angular.module('civicase');

  module.controller('civicaseDashboardController', civicaseDashboardController);

  function civicaseDashboardController ($scope, crmApi, formatActivity, $timeout) {
    $scope.ts = CRM.ts('civicase');
    $scope.checkPerm = CRM.checkPerm;
    $scope.url = CRM.url;
    $scope.filters = {};
    $scope.activityFilters = {
      case_filter: {'case_type_id.is_active': 1, contact_is_deleted: 0}
    };

    (function init () {
      bindRouteParamsToScope();
      initWatchers();
      prepareCaseFilterOption();
    }());

    $scope.caseListLink = function (type, status) {
      var cf = {};
      if (type) {
        cf.case_type_id = [type];
      }
      if (status) {
        cf.status_id = [status];
      }
      if ($scope.myCasesOnly) {
        cf.case_manager = CRM.config.user_contact_id;
      }
      return '#/case/list?' + $.param({cf: JSON.stringify(cf)});
    };

    /**
     * Bind route paramaters to scope variables
     */
    function bindRouteParamsToScope () {
      $scope.$bindToRoute({ param: 'dtab', expr: 'activeTab', format: 'int', default: 0 });
      $scope.$bindToRoute({ param: 'drel', expr: 'filters.caseRelationshipType', format: 'raw', default: 'is_involved' });
    }

    /**
     * Watcher for caseRelationshipType
     *
     * @param {String} newValue
     */
    function caseRelationshipTypeWatcher (newValue) {
      newValue === 'is_case_manager'
        ? $scope.activityFilters.case_filter.case_manager = CRM.config.user_contact_id
        : delete ($scope.activityFilters.case_filter.case_manager);

      newValue === 'is_involved'
        ? $scope.activityFilters.case_filter.contact_involved = {'IN': [CRM.config.user_contact_id]}
        : delete ($scope.activityFilters.case_filter.contact_involved);
    }

    /**
     * Initialise watchers
     */
    function initWatchers () {
      $scope.$watch('filters.caseRelationshipType', caseRelationshipTypeWatcher);
    }

    /**
     * Prepare case filter options for crmUiSelect
     */
    function prepareCaseFilterOption () {
      var options = [
        { 'text': 'My cases', 'id': 'is_case_manager' },
        { 'text': 'Cases I am involved in', 'id': 'is_involved' }
      ];

      if (CRM.checkPerm('access all cases and activities')) {
        options.push({ 'text': 'All Cases', 'id': 'all' });
      }

      $scope.caseRelationshipOptions = options;
    }
  }
})(angular, CRM.$);
