(function (angular, $, _) {
  var module = angular.module('civicase');

  module.config(function ($routeProvider) {
    $routeProvider.when('/case', {
      reloadOnSearch: false,
      controller: 'civicaseDashboardController',
      templateUrl: '~/civicase/Dashboard.html'
    });
  });

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
        ? $scope.activityFilters.case_filter.case_manager = [CRM.config.user_contact_id]
        : delete ($scope.activityFilters.case_filter.case_manager);

      newValue === 'is_involved'
        ? $scope.activityFilters.case_filter.contact_id = [CRM.config.user_contact_id]
        : delete ($scope.activityFilters.case_filter.contact_id);
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

    /**
     * Initialise watchers
     */
    function initWatchers () {
      $scope.$watch('filters.caseRelationshipType', caseRelationshipTypeWatcher);
    }
  }

  module.directive('civicaseDashboardTabsetAffix', function ($timeout) {
    return {
      link: civicaseDashboardTabsetAffixLink
    };

    function civicaseDashboardTabsetAffixLink (scope) {
      $timeout(function () {
        var $tabNavigation = $('.civicase__dashboard__tab-container ul.nav');
        var $civicrmMenu = $('#civicrm-menu');
        var $toolbarDrawer = $('#toolbar .toolbar-drawer');
        var $tabContainer = $('.civicase__dashboard__tab-container');

        $tabNavigation.affix({
          offset: {
            top: $tabContainer.offset().top - ($toolbarDrawer.height() + $civicrmMenu.height())
          }
        }).on('affixed.bs.affix', function () {
          $tabNavigation.css('top', $civicrmMenu.height() + $toolbarDrawer.height());
        }).on('affixed-top.bs.affix', function () {
          $tabNavigation.css('top', 'auto');
        });
      });
    }
  });
})(angular, CRM.$, CRM._);
