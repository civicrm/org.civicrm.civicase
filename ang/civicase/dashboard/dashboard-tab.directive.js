(function (angular, $, _, statusTypes) {
  var module = angular.module('civicase');

  module.directive('civicaseDashboardTab', function () {
    return {
      restrict: 'E',
      controller: 'dashboardTabController',
      templateUrl: '~/civicase/dashboard/dashboard-tab.directive.html'
    };
  });

  module.controller('dashboardTabController', dashboardTabController);

  function dashboardTabController ($location, $rootScope, $route, $sce, $scope,
    ContactsCache, crmApi, formatCase, formatActivity) {
    var ACTIVITIES_QUERY_PARAMS_DEFAULTS = {
      'contact_id': 'user_contact_id',
      'is_current_revision': 1,
      'is_deleted': 0,
      'is_test': 0,
      'activity_type_id.grouping': { 'NOT LIKE': '%milestone%' },
      'status_id': { 'IN': CRM.civicase.activityStatusTypes.incomplete },
      'options': { 'sort': 'is_overdue DESC, activity_date_time ASC' },
      'return': [
        'subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name',
        'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star',
        'original_id', 'tag_id.name', 'tag_id.description', 'tag_id.color', 'file_id',
        'is_overdue', 'case_id', 'priority_id', 'case_id.case_type_id', 'case_id.status_id',
        'case_id.contacts'
      ]
    };
    var CASES_QUERY_PARAMS_DEFAULTS = {
      'status_id.grouping': 'Opened',
      'options': { 'sort': 'start_date DESC' },
      'is_deleted': 0
    };
    var MILESTONES_QUERY_PARAMS_DEFAULTS = {
      'contact_id': 'user_contact_id',
      'is_current_revision': 1,
      'is_deleted': 0,
      'is_test': 0,
      'activity_type_id.grouping': { 'LIKE': '%milestone%' },
      'status_id': { 'IN': CRM.civicase.activityStatusTypes.incomplete },
      'options': { 'sort': 'is_overdue DESC, activity_date_time ASC' },
      'return': [
        'subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name',
        'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star',
        'original_id', 'tag_id.name', 'tag_id.description', 'tag_id.color', 'file_id',
        'is_overdue', 'case_id', 'priority_id', 'case_id.case_type_id', 'case_id.status_id',
        'case_id.contacts'
      ]
    };

    var defaultsMap = {
      activities: ACTIVITIES_QUERY_PARAMS_DEFAULTS,
      cases: CASES_QUERY_PARAMS_DEFAULTS,
      milestones: MILESTONES_QUERY_PARAMS_DEFAULTS
    };

    $scope.caseIds = null;
    $scope.activitiesPanel = {
      name: 'activities',
      query: {
        entity: 'Activity',
        action: 'getcontactactivities',
        countAction: 'getcontactactivitiescount',
        params: getQueryParams('activities')
      },
      custom: {
        itemName: 'activities',
        involvementFilter: { '@involvingContact': 'myActivities' },
        cardRefresh: activityCardRefreshActivities
      },
      handlers: {
        range: _.curry(rangeHandler)('activity_date_time')('YYYY-MM-DD HH:mm:ss')(false),
        results: _.curry(resultsHandler)(formatActivity)('case_id.contacts')
      }
    };
    $scope.newMilestonesPanel = {
      name: 'milestones',
      query: {
        entity: 'Activity',
        action: 'getcontactactivities',
        countAction: 'getcontactactivitiescount',
        params: getQueryParams('milestones')
      },
      custom: {
        itemName: 'milestones',
        involvementFilter: { '@involvingContact': 'myActivities' },
        cardRefresh: activityCardRefreshMilestones
      },
      handlers: {
        range: _.curry(rangeHandler)('activity_date_time')('YYYY-MM-DD HH:mm:ss')(true),
        results: _.curry(resultsHandler)(formatActivity)('case_id.contacts')
      }
    };
    $scope.newCasesPanel = {
      custom: {
        itemName: 'cases',
        caseClick: casesCustomClick,
        viewCasesLink: viewCasesLink()
      },
      query: { entity: 'Case', action: 'getcaselist', countAction: 'getdetailscount', params: getQueryParams('cases') },
      handlers: {
        range: _.curry(rangeHandler)('start_date')('YYYY-MM-DD')(false),
        results: _.curry(resultsHandler)(formatCase)('contacts')
      }
    };

    $scope.activityCardRefreshCalendar = activityCardRefreshCalendar;

    (function init () {
      initWatchers();
      loadCaseIds();
    }());

    /**
     * Refresh callback triggered by activity cards in the activities panel
     *
     * @param {Array} [apiCalls]
     */
    function activityCardRefreshActivities (apiCalls) {
      activityCardRefresh($scope.activitiesPanel.name, apiCalls);
    }

    /**
     * Refresh callback triggered by activity cards in the calendar
     *
     * @param {Array} [apiCalls]
     */
    function activityCardRefreshCalendar (apiCalls) {
      activityCardRefresh([
        $scope.activitiesPanel.name,
        $scope.newMilestonesPanel.name
      ], apiCalls);
    }

    /**
     * Refresh callback triggered by activity cards in the milestones panel
     *
     * @param {Array} [apiCalls]
     */
    function activityCardRefreshMilestones (apiCalls) {
      activityCardRefresh($scope.newMilestonesPanel.name, apiCalls);
    }

    /**
     * The common refresh callback logic triggered by the activity cards in the dashboard
     * It reloads of the calendar and the panel(s) with the given name(s)
     *
     * Unfortunately the activity card expects the callback to handle api calls
     * for it, hence the `apiCalls` param and the usage of `crmApi`
     *
     * @see {@link https://github.com/compucorp/uk.co.compucorp.civicase/blob/develop/ang/civicase/ActivityCard.js#L97}
     *
     * @param {Array/String} panelName the name of the panel to refresh
     * @param {Array} [apiCalls]
     */
    function activityCardRefresh (panelName, apiCalls) {
      if (!_.isArray(apiCalls)) {
        apiCalls = [];
      }

      crmApi(apiCalls).then(function (result) {
        $rootScope.$emit('civicase::ActivitiesCalendar::reload');
        $rootScope.$emit('civicase::PanelQuery::reload', panelName);
      });
    }

    /**
     * Click handler that redirects the browser to the given case's details page
     *
     * @param {Object} caseObj
     */
    function casesCustomClick (caseObj) {
      $location.path('case/list').search('caseId', caseObj.id);
    }

    /**
     * Get the processed list of query pars of the given collection (cases, milestones, etc)
     *
     * @param {String}
     * @return {Object{}}
     */
    function getQueryParams (collection) {
      var activityFiltersCopy = _.cloneDeep($scope.activityFilters);

      // Cases need the properties of `activityFilters.case_filter` in the
      // object root
      return _.assign({}, defaultsMap[collection], (collection === 'cases'
        ? activityFiltersCopy.case_filter
        : activityFiltersCopy
      ));
    }

    /**
     * Initializes the controller watchers
     */
    function initWatchers () {
      $scope.$watchCollection('filters.caseRelationshipType', function (newType, oldType) {
        if (newType === oldType) {
          return;
        }

        $scope.activitiesPanel.query.params = getQueryParams('activities');
        $scope.newMilestonesPanel.query.params = getQueryParams('milestones');
        $scope.newCasesPanel.query.params = getQueryParams('cases');
        $scope.newCasesPanel.custom.viewCasesLink = viewCasesLink();

        loadCaseIds();
      });

      // When the involvement filters change, broadcast the event that will be
      // caught by the activity-filters-contact directive which will add the
      // correct query params to match the filter value
      $scope.$watch('newMilestonesPanel.custom.involvementFilter', function (newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }

        updatePanelQueryActions($scope.newMilestonesPanel);
        $rootScope.$broadcast(
          'civicaseActivityFeed.query',
          $scope.newMilestonesPanel.custom.involvementFilter,
          $scope.newMilestonesPanel.query.params,
          true
        );
      }, true);

      $scope.$watch('activitiesPanel.custom.involvementFilter', function (newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }

        updatePanelQueryActions($scope.activitiesPanel);
        $rootScope.$broadcast(
          'civicaseActivityFeed.query',
          $scope.activitiesPanel.custom.involvementFilter,
          $scope.activitiesPanel.query.params,
          true
        );
      }, true);
    }

    /**
     * It fetches and stores the ids of all the open cases that match the
     * current relationship filter's value.
     *
     * The ids are used for the activities calendar
     */
    function loadCaseIds () {
      crmApi('Case', 'getcaselist', _.assign({
        'status_id.grouping': 'Opened',
        'return': 'id',
        sequential: 1,
        options: { limit: 0 }
      }, $scope.activityFilters.case_filter))
        .then(function (result) {
          $scope.caseIds = result.values.map(function (caseObj) {
            return caseObj.id;
          });
        });
    }

    /**
     * Sets the range of the date of the entity (Case / Activity)
     *
     * @param {String} property the property where the information about the date is stored
     * @param {String} format the date format
     * @param {Boolean} useNowAsStart whether the starting point should be the current datetime
     * @param {String} selectedRange the currently selected period range
     * @param {Object} queryParams
     */
    function rangeHandler (property, format, useNowAsStart, selectedRange, queryParams) {
      var now = moment();
      var start = (useNowAsStart ? now : now.startOf(selectedRange)).format(format);
      var end = now.endOf(selectedRange).format(format);

      queryParams[property] = { 'BETWEEN': [start, end] };
    }

    /**
     * Formats each results (whether a case or an entity) returned by the api call,
     * and fetches the data of all the contacts referenced in the list
     *
     * @param {Function} formatFn the function that will do the formatting
     * @param {String} contactsProp the property where the list of contacts is stored
     * @param {Array} results the list of results
     */
    function resultsHandler (formatFn, contactsProp, results) {
      // Flattened list of all the contact ids of all the contacts of all the cases
      var contactIds = _(results).pluck(contactsProp).flatten().pluck('contact_id').uniq().value();
      var formattedResults = results.map(formatFn);
      // The try/catch block is necessary because the service does not
      // return a Promise if it doesn't find any new contacts to fetch
      try {
        return ContactsCache.add(contactIds)
          .then(function () {
            return formattedResults;
          });
      } catch (e) {
        return formattedResults;
      }
    }

    /**
     * Updates the action and count action for the given panel query data depending on the selected filter.
     * When filtering by "My Activities" the action is "getcontactactivities" and "getcontactactivitiescount",
     * otherwise it's "get" and "getcount".
     *
     * @param {Object} panelQueryData
     */
    function updatePanelQueryActions (panelQueryData) {
      var defaultActions = { action: 'get', countAction: 'getcount' };
      var myActivityActions = { action: 'getcontactactivities', countAction: 'getcontactactivitiescount' };
      var isRequestingMyActivities = panelQueryData.custom.involvementFilter['@involvingContact'] === 'myActivities';

      $.extend(panelQueryData.query, isRequestingMyActivities ? myActivityActions : defaultActions);
    }

    /**
     * Returns an object representing the "view cases" link
     *
     * Depending on the value of the relationship type filter, both the label
     * and the url of the link might change
     *
     * This function is being called directly on the view so that the object
     * is updated automatically whenever the relationship type filter value changes
     *
     * @return {Object}
     */
    function viewCasesLink () {
      var queryParams = viewCasesQueryParams();

      return {
        url: $sce.trustAsResourceUrl('#/case/list?' + $.param(queryParams)),
        label: $scope.filters.caseRelationshipType === 'all'
          ? 'View all cases'
          : 'View all my cases'
      };
    }

    /**
     * Returns the query string params for the "view cases" link
     *
     * The only query string parameter needed by the link is
     *   `cf.case_manager` if the relationship type filter is set on "My Cases"
     *   `cf.contact_id` if the relationship type filter is set on "Cases I'm involved in""
     *
     * If the relationship type filter is set on "All Cases", then
     * no parameter is needed
     *
     * @return {Object}
     */
    function viewCasesQueryParams () {
      var params = {};

      if ($scope.filters.caseRelationshipType !== 'all') {
        params.cf = {};

        // @NOTE: The case list page expects the param's value to be
        // inside an array (`case_filter.contact_id` already is)
        if ($scope.filters.caseRelationshipType === 'is_case_manager') {
          params.cf.case_manager = [$scope.activityFilters.case_filter.case_manager];
        } else {
          params.cf.contact_id = $scope.activityFilters.case_filter.contact_id;
        }

        params.cf = JSON.stringify(params.cf);
      }

      return params;
    }
  }
})(angular, CRM.$, CRM._, CRM.civicase.activityStatusTypes);
