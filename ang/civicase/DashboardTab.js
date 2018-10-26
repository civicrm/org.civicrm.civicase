(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseDashboardTab', function () {
    return {
      restrict: 'E',
      controller: 'dashboardTabController',
      templateUrl: '~/civicase/DashboardTab.html'
    };
  });

  module.controller('dashboardTabController', dashboardTabController);

  function dashboardTabController ($location, $scope, ContactsDataService, formatCase) {
    var CASES_QUERY_PARAMS_DEFAULTS = {
      'status_id.grouping': 'Opened',
      'options': { 'sort': 'start_date DESC' }
    };

    $scope.newCasesPanel = {
      query: {
        entity: 'Case',
        action: 'getcaselist',
        params: casesQueryParams()
      },
      handlers: {
        range: casesRangeHandler,
        results: casesResultsHandler
      },
      custom: {
        itemName: 'cases',
        caseClick: casesCustomClick
      }
    };

    (function init () {
      initWatchers();
    }());

    /**
     * Click handler that redirects the browser to the given case's details page
     *
     * @param {Object} caseObj
     */
    function casesCustomClick (caseObj) {
      $location.path('case/list').search('caseId', caseObj.id);
    }

    /**
     * Returns a copy of the default query params for cases, interpolated with
     * the currently selected relationship type filter's params
     *
     * @return {Object}
     */
    function casesQueryParams () {
      return _.assign({}, CASES_QUERY_PARAMS_DEFAULTS, $scope.activityFilters.case_filter);
    }

    /**
     * Sets the range of the case start date
     *
     * @param {String} selectedRange the currently selected period range
     * @param {Object} queryParams
     */
    function casesRangeHandler (selectedRange, queryParams) {
      var now = moment();
      var end = now.endOf(selectedRange).format('YYYY-MM-DD');
      var start = now.startOf(selectedRange).format('YYYY-MM-DD');

      queryParams.start_date = { 'BETWEEN': [start, end] };
    }

    /**
     * Formats each cases returned by the api call, and fetches the data
     * of all the contacts referenced in every case
     *
     * @param {Array} results
     */
    function casesResultsHandler (results) {
      // Flattened list of all the contact ids of all the contacts of all the cases
      var contactIds = _(results).pluck('contacts').flatten().pluck('contact_id').uniq().value();
      var formattedResults = results.map(formatCase);

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

    /**
     * Initializes the controller watchers
     */
    function initWatchers () {
      $scope.$watchCollection('filters.caseRelationshipType', function (newType, oldType) {
        if (newType !== oldType) {
          $scope.newCasesPanel.query.params = casesQueryParams();
        }
      });
    }
  }
})(angular, CRM.$, CRM._);
