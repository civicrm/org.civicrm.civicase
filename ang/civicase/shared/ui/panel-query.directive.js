(function (angular, _, ts) {
  var module = angular.module('civicase');

  module.directive('civicasePanelQuery', function () {
    return {
      restrict: 'E',
      templateUrl: '~/civicase/shared/ui/panel-query.directive.html',
      link: linkFn,
      controller: 'panelQueryCtrl',
      scope: {
        query: '<',
        name: '@?',
        customData: '<?',
        handlers: '<?'
      },
      transclude: {
        actions: '?panelQueryActions',
        empty: '?panelQueryEmpty',
        results: 'panelQueryResults',
        title: '?panelQueryTitle'
      }
    };

    function linkFn ($scope, $element, $attrs, $controller, $transclude) {
      ['actions', 'empty', 'results', 'title'].forEach(function (slot) {
        $transclude($scope, function (clone, scope) {
          $element.find('[ng-transclude="' + slot + '"]').html(clone);
        }, false, slot);
      });
    }
  });

  module.controller('panelQueryCtrl', panelQueryCtrl);

  panelQueryCtrl.$inject = ['$log', '$q', '$rootScope', '$scope', 'crmApi'];

  function panelQueryCtrl ($log, $q, $rootScope, $scope, crmApi) {
    var PAGE_SIZE = 5;
    var cacheByPage = [];

    $scope.customData = $scope.customData || {};
    $scope.handlers = $scope.handlers || {};
    $scope.loading = { full: false, partial: false };
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
      $scope.name = $scope.name || _.uniqueId('panel-query-');

      initListeners();
      initWatchers();
      verifyData();
      loadData();
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
     * Resets both the cache and the pagination
     */
    function dataReset () {
      cacheByPage = [];
      $scope.pagination.page = 1;
    }

    /**
     * Fetches the data, either via the cache or the api
     *
     * @param {Boolean} skipCount
     * @return {Promise}
     */
    function fetchData (skipCount) {
      var cachedPage = cacheByPage[$scope.pagination.page];

      if (cachedPage && cachedPage.length) {
        $scope.results = cachedPage;

        return $q.resolve();
      }

      return fetchDataViaApi(skipCount)
        .then(function () {
          cacheByPage[$scope.pagination.page] = $scope.results;
        });
    }

    /**
     * Fetches the data via the Civi API and stores the response
     * It uses a deep copy of the original query parameters in order to modify
     * them without triggering their watcher
     *
     * @param {Boolean} skipCount if true then the "getcount" request won't be sent
     * @return {Promise}
     */
    function fetchDataViaApi (skipCount) {
      var paramsCopy = _.cloneDeep($scope.query.params);

      if ($scope.handlers.range) {
        $scope.handlers.range($scope.selectedRange, paramsCopy);
      }

      var apiCalls = {
        get: [ $scope.query.entity, ($scope.query.action || 'get'), prepareGetParams(paramsCopy) ],
        count: [ $scope.query.entity, ($scope.query.countAction || 'getcount'), paramsCopy ]
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
     * Initializes the directive's event listeners
     */
    function initListeners () {
      $rootScope.$on('civicase::PanelQuery::reload', reloadEventHandler);
    }

    /**
     * Initializes the directive's watchers
     */
    function initWatchers () {
      // Triggers a refresh when the query params change
      $scope.$watch('query.params', function (newParams, oldParams) {
        (newParams !== oldParams) && loadData();
      }, true);

      // Triggers a refresh when the selected range changes
      $scope.$watch('selectedRange', function (newRange, oldRange) {
        (newRange !== oldRange) && loadData();
      });

      // Triggers a new request and a recalculation of the pagination range
      // when the current page changes
      $scope.$watch('pagination.page', function (newPage, oldPage) {
        (newPage !== oldPage) && loadData(true);
      });
    }

    /**
     * Loads the data and triggers any subsequent logic
     *
     * @param {Boolean} skipCount sets whether the directive needs to recalculate the total
     * @return {Promise}
     */
    function loadData (skipCount) {
      // Prevents accidental additional call by watchers
      if ($scope.loading.full || $scope.loading.partial) {
        return;
      }

      !skipCount && dataReset();
      toggleLoadingState(skipCount);

      return fetchData(skipCount)
        .then(updatePaginationRange)
        .then(function () {
          toggleLoadingState(skipCount);
        });
    }

    /**
     * Prepare the parameters for the "get" request before passing them to the API
     *
     * @NOTE: The cumbersome implementation was necessary because the current
     * version of lodash in Civi does not have the _.defaultsDeep() method
     *
     * @param {Object} queryParams
     * @return {String}
     */
    function prepareGetParams (queryParams) {
      var requestParams = _.cloneDeep(queryParams) || {};

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
     * It triggers a full reload if the panel's name is passed with the event
     *
     * @param {Object} $event
     * @param {String/Array} name
     */
    function reloadEventHandler ($event, name) {
      var refresh = _.isArray(name)
        ? _.includes(name, $scope.name)
        : $scope.name === name;

      refresh && loadData();
    }

    /**
     * Activates / Deactivates the loading state of the directive
     *
     * @param {Boolean} partial whether the loading mode is "partial" instead of "full"
     */
    function toggleLoadingState (partial) {
      var mode = partial ? 'partial' : 'full';

      $scope.loading[mode] = !$scope.loading[mode];
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
