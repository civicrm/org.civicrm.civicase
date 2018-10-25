(function (angular, _, ts) {
  var module = angular.module('civicase');

  module.directive('civicasePanelQuery', function () {
    return {
      restrict: 'E',
      templateUrl: '~/civicase/PanelQuery.html',
      link: linkFn,
      controller: 'panelQueryCtrl',
      scope: {
        query: '<',
        customData: '<?',
        handlers: '<?'
      },
      transclude: {
        actions: '?panelQueryActions',
        results: 'panelQueryResults',
        title: '?panelQueryTitle'
      }
    };

    function linkFn ($scope, $element, $attrs, $controller, $transclude) {
      ['actions', 'results', 'title'].forEach(function (slot) {
        $transclude($scope, function (clone, scope) {
          $element.find('[ng-transclude="' + slot + '"]').html(clone);
        }, false, slot);
      });
    }
  });

  module.controller('panelQueryCtrl', panelQueryCtrl);

  panelQueryCtrl.$inject = ['$log', '$q', '$scope', 'crmApi'];

  function panelQueryCtrl ($log, $q, $scope, crmApi) {
    var PAGE_SIZE = 5;

    $scope.customData = $scope.customData || {};
    $scope.handlers = $scope.handlers || {};
    $scope.loading = false;
    $scope.results = [];
    $scope.total = 0;
    $scope.ts = ts;
    $scope.selectedRange = 'week';
    $scope.periodRange = [
      { label: 'This Week', value: 'week' },
      { label: 'This Month', value: 'month' }
    ];
    $scope.pagination = {
      page: 1,
      size: PAGE_SIZE,
      range: { from: 1, to: PAGE_SIZE }
    };

    (function init () {
      verifyData();
      // the range handler must be invoked immediately on init to
      // include the selected period range in the first api request
      invokeRangeHandler();
      loadData().then(initWatchers);
    }());

    /**
     * Calculates the offset of the results list based
     * on the current page number and page size
     *
     * @return {String}
     */
    function calculatePageOffset () {
      return ($scope.pagination.page - 1) * $scope.pagination.size;
    }

    /**
     * Fetches the data via the Civi API and stores the response
     *
     * @param {Boolean} skipCount if true then the "getcount" request won't be sent
     * @return {Promise}
     */
    function fetchDataViaApi (skipCount) {
      var apiCalls = {
        get: [ $scope.query.entity, $scope.query.action || 'get', prepareRequestParams() ],
        count: [ $scope.query.entity, 'getcount', $scope.query.params ]
      };

      skipCount && (delete apiCalls.count);

      return crmApi(apiCalls)
        .then(function (result) {
          !skipCount && ($scope.total = result.count);

          return processResults(result.get.values);
        })
        .then(function (processed) {
          $scope.results = processed;
        });
    }

    /**
     * Initializes the directive's watchers
     */
    function initWatchers () {
      // Triggers a refresh when the query params change
      $scope.$watchCollection('query.params', function (newParams, oldParams) {
        (newParams !== oldParams) && loadData();
      }, true);

      // Triggers the range handler when the selected range changes
      $scope.$watch('selectedRange', function (newRange, oldRange) {
        (newRange !== oldRange) && invokeRangeHandler();
      });

      // Triggers a new request and a recalculation of the pagination range
      // when the current page changes
      $scope.$watch('pagination.page', function (newPage, oldPage) {
        (newPage !== oldPage) && loadData(true);
      });
    }

    /**
     * Invokes the period range handler, if present
     */
    function invokeRangeHandler () {
      $scope.handlers.range &&
      $scope.handlers.range($scope.selectedRange, $scope.query.params);
    }

    /**
     * Loads the data and triggers any subsequent logic
     *
     * @param {Boolean} skipCount sets whether the directive needs to recalculate the total
     * @return {Promise}
     */
    function loadData (skipCount) {
      if (!skipCount) {
        $scope.pagination.page = 1;
        $scope.loading = true;
      }

      return fetchDataViaApi(skipCount)
        .then(updatePaginationRange)
        .then(function () {
          if (!skipCount) {
            $scope.loading = false;
          }
        });
    }

    /**
     * Prepare the parameters of the request before passing them to the API
     *
     * @NOTE: The cumbersome implementation was necessary because the current
     * version of lodash in Civi does not have the _.defaultsDeep() method
     *
     * @return {String}
     */
    function prepareRequestParams () {
      var requestParams = _.assign({}, $scope.query.params);

      requestParams.sequential = 1;
      requestParams.options = _.defaults({}, {
        limit: $scope.pagination.size,
        offset: calculatePageOffset()
      }, requestParams.options);

      return requestParams;
    }

    /**
     * Process the list of results via the "results" handler (if provided)
     * before storing it
     *
     * @param {Array} results
     * @return {Promise}
     */
    function processResults (results) {
      return $q.resolve($scope.handlers.results ? $scope.handlers.results(results) : results);
    }

    /**
     * Updates the from..to range displayed in the pagination
     */
    function updatePaginationRange () {
      $scope.pagination.range.from = calculatePageOffset() + 1;
      $scope.pagination.range.to = ($scope.pagination.page * $scope.pagination.size);

      if ($scope.pagination.range.to > $scope.total) {
        $scope.pagination.range.to = $scope.total;
      }
    }

    /**
     * Verifies that the given data has at least the mandatory properties
     *
     * @throws Error
     */
    function verifyData () {
      if (!$scope.query) {
        throw new Error('You need to provide a `query` object');
      }

      if (!$scope.query.entity) {
        throw new Error('The `query` object needs to have a `entity` value');
      }
    }
  }
}(angular, CRM._, CRM.ts('civicase')));
