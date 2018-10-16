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
    var activitiesToShow = 10;

    $scope.ts = CRM.ts('civicase');
    $scope.caseStatuses = CRM.civicase.caseStatuses;
    $scope.caseTypes = CRM.civicase.caseTypes;
    $scope.caseTypesLength = _.size(CRM.civicase.caseTypes);
    $scope.checkPerm = CRM.checkPerm;
    $scope.url = CRM.url;
    $scope.activityPlaceholders = _.range(activitiesToShow);
    $scope.summaryData = [];
    $scope.dashboardActivities = {};
    $scope.filters = {};
    $scope.activityFilters = {
      case_filter: {'case_type_id.is_active': 1, contact_is_deleted: 0}
    };

    (function init () {
      bindRouteParamsToScope();
      initWatchers();
      prepareCaseFilterOption();

      // We hide the breakdown when there's only one case type
      if ($scope.caseTypesLength < 2) {
        $scope.showBreakdown = false;
      }
    }());

    $scope.showHideBreakdown = function () {
      $scope.showBreakdown = !$scope.showBreakdown;
    };

    $scope.seeAllLink = function (category, statusFilter) {
      var params = {
        dtab: 1,
        drel: $scope.caseRelationshipType,
        dbd: 0,
        af: JSON.stringify({
          'activity_type_id.grouping': category,
          status_id: CRM.civicase.activityStatusTypes[statusFilter]
        })
      };
      return '#/case?' + $.param(params);
    };

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

    $scope.refresh = function (apiCalls) {
      apiCalls = apiCalls || [];
      apiCalls.push(['Case', 'getstats', {my_cases: $scope.myCasesOnly}]);
      var params = _.extend({
        sequential: 1,
        is_current_revision: 1,
        is_test: 0,
        return: ['case_id', 'activity_type_id', 'subject', 'activity_date_time', 'status_id', 'target_contact_name', 'assignee_contact_name', 'is_overdue', 'is_star', 'file_id', 'case_id.case_type_id', 'case_id.status_id', 'case_id.contacts']
      }, $scope.activityFilters);
      // recent communication
      apiCalls.push(['Activity', 'get', _.extend({
        'activity_type_id.grouping': {LIKE: '%communication%'},
        'status_id.filter': 1,
        options: {limit: activitiesToShow, sort: 'activity_date_time DESC'}
      }, params)]);
      apiCalls.push(['Activity', 'getcount', _.extend({
        'activity_type_id.grouping': {LIKE: '%communication%'},
        'status_id.filter': 1,
        is_current_revision: 1,
        is_test: 0
      }, $scope.activityFilters)]);
      // next milestones
      apiCalls.push(['Activity', 'get', _.extend({
        'activity_type_id.grouping': {LIKE: '%milestone%'},
        'status_id.filter': 0,
        options: {limit: activitiesToShow, sort: 'activity_date_time ASC'}
      }, params)]);
      apiCalls.push(['Activity', 'getcount', _.extend({
        'activity_type_id.grouping': {LIKE: '%milestone%'},
        'status_id.filter': 0,
        is_current_revision: 1,
        is_test: 0
      }, $scope.activityFilters)]);
      crmApi(apiCalls).then(function (data) {
        $scope.$broadcast('caseRefresh');
        $scope.summaryData = data[apiCalls.length - 5].values;
        $scope.dashboardActivities.recentCommunication = _.each(data[apiCalls.length - 4].values, formatActivity);
        $scope.dashboardActivities.recentCommunicationCount = data[apiCalls.length - 3];
        $scope.dashboardActivities.nextMilestones = _.each(data[apiCalls.length - 2].values, formatActivity);
        $scope.dashboardActivities.nextMilestonesCount = data[apiCalls.length - 1];
      });
    };

    /**
     * Bind route paramaters to scope variables
     */
    function bindRouteParamsToScope () {
      $scope.$bindToRoute({ param: 'dtab', expr: 'activeTab', format: 'int', default: 0 });
      $scope.$bindToRoute({ param: 'dbd', expr: 'showBreakdown', format: 'bool', default: false });
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

    // TODO: commented as it might be required in the dashboard tab, should be removed once dashboard tab is developed
    // Translate between the dashboard's global filter-options and
    // the narrower, per-section filter-options.

    // $scope.$watch('myCasesOnly', function (myCasesOnly) {
    //   $scope.activityFilters = {
    //     case_filter: {'case_type_id.is_active': 1, contact_is_deleted: 0}
    //   };
    //   var recentCaseFilter = {
    //     'status_id.grouping': 'Opened'
    //   };
    //   if (myCasesOnly) {
    //     $scope.activityFilters.case_filter.case_manager = CRM.config.user_contact_id;
    //     recentCaseFilter.case_manager = [CRM.config.user_contact_id];
    //   }
    //   $scope.recentCaseFilter = recentCaseFilter;
    //   $scope.recentCaseLink = '#/case/list?sf=modified_date&sd=DESC' + (myCasesOnly ? ('&cf=' + JSON.stringify({case_manager: [CRM.config.user_contact_id]})) : '');
    //   $scope.refresh();
    // });
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
