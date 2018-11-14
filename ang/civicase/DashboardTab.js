(function (angular, $, _, statusTypes) {
  var module = angular.module('civicase');

  module.directive('civicaseDashboardTab', function () {
    return {
      restrict: 'E',
      controller: 'dashboardTabController',
      templateUrl: '~/civicase/DashboardTab.html'
    };
  });

  module.controller('dashboardTabController', dashboardTabController);

  function dashboardTabController ($location, $rootScope, $route, $scope,
    ContactsDataService, crmApi, formatCase, formatActivity) {
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
      'options': { 'sort': 'start_date DESC' }
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
      query: { entity: 'Activity', params: getQueryParams('activities') },
      custom: {
        itemName: 'activities',
        involvementFilter: { '@involvingContact': 'myActivities' }
      },
      handlers: {
        range: _.curry(rangeHandler)('activity_date_time')('YYYY-MM-DD HH:mm:ss')(false),
        results: _.curry(resultsHandler)(formatActivity)('case_id.contacts')
      }
    };
    $scope.newMilestonesPanel = {
      query: { entity: 'Activity', params: getQueryParams('milestones') },
      custom: {
        itemName: 'milestones',
        involvementFilter: { '@involvingContact': 'myActivities' }
      },
      handlers: {
        range: _.curry(rangeHandler)('activity_date_time')('YYYY-MM-DD HH:mm:ss')(true),
        results: _.curry(resultsHandler)(formatActivity)('case_id.contacts')
      }
    };
    $scope.newCasesPanel = {
      custom: { itemName: 'cases', caseClick: casesCustomClick },
      query: { entity: 'Case', action: 'getcaselist', params: getQueryParams('cases') },
      handlers: {
        range: _.curry(rangeHandler)('start_date')('YYYY-MM-DD')(false),
        results: _.curry(resultsHandler)(formatCase)('contacts')
      }
    };

    $scope.activityCardRefresh = activityCardRefresh;

    (function init () {
      initWatchers();
      loadCaseIds();
    }());

    /**
     * The refresh callback passed to the activity cards
     *
     * Unfortunately the activity card expects the callback to handle api calls
     * for it, hence the `apiCalls` param and the usage of `crmApi`
     *
     * @see {@link https://github.com/compucorp/uk.co.compucorp.civicase/blob/develop/ang/civicase/ActivityCard.js#L97}
     */
    function activityCardRefresh (apiCalls) {
      if (!_.isArray(apiCalls)) {
        apiCalls = [];
      }

      crmApi(apiCalls).then(function (result) {
        $rootScope.$emit('civicase::ActivitiesCalendar::reload');
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
        $scope.newCasesPanel.query.params = getQueryParams('cases');
        $scope.newMilestonesPanel.query.params = getQueryParams('milestones');

        loadCaseIds();
      });

      // When the involvement filters change, broadcast the event that will be
      // caught by the activity-filters-contact directive which will add the
      // correct query params to match the filter value
      $scope.$watch('newMilestonesPanel.custom.involvementFilter', function (newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }

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
        return ContactsDataService.add(contactIds)
          .then(function () {
            return formattedResults;
          });
      } catch (e) {
        return formattedResults;
      }
    }
  }
})(angular, CRM.$, CRM._, CRM.civicase.activityStatusTypes);
