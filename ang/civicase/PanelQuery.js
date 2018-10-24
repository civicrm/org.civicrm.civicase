(function (angular, _) {
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
        results: 'panelQueryResults'
      }
    };

    function linkFn ($scope, $element, $attrs, $controller, $transclude) {
      $transclude($scope, function (clone, scope) {
        $element.find('[ng-transclude="actions"]').html(clone);
      }, false, 'actions');

      $transclude($scope, function (clone, scope) {
        $element.find('[ng-transclude="results"]').html(clone);
      }, false, 'results');
    }
  });

  module.controller('panelQueryCtrl', panelQueryCtrl);

  panelQueryCtrl.$inject = ['$log', '$scope', 'crmApi'];

  function panelQueryCtrl ($log, $scope, crmApi) {
    var PAGE_SIZE = 5;

    $scope.customData = $scope.customData || {};
    $scope.handlers = $scope.handlers || {};
    $scope.results = [];
    $scope.title = '---';
    $scope.total = 0;
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
     * Fetches the data via the Civi API and stores the response
     *
     * @return {Promise}
     */
    function fetchDataViaApi () {
      return crmApi({
        get: [ $scope.query.entity, 'get', prepareRequestParams() ],
        count: [ $scope.query.entity, 'getcount', $scope.query.params ]
      })
        .then(function (result) {
          $scope.results = processResults(result.get.values);
          $scope.total = result.count;
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

      // Triggers the range handler (if present) when the selected range changes
      $scope.$watch('selectedRange', function (newRange, oldRange) {
        if (newRange !== oldRange && $scope.handlers.range) {
          $scope.handlers.range($scope.selectedRange, $scope.query.params);
        }
      });

      // Triggers a recalculation of the pagination range when the current page changes
      $scope.$watch('pagination.page', function (newPage, oldPage) {
        if (newPage !== oldPage) {
          $scope.pagination.range.from = calculatePageOffset() + 1;
          $scope.pagination.range.to = ($scope.pagination.page * $scope.pagination.size);

          if ($scope.pagination.range.to > $scope.total) {
            $scope.pagination.range.to = $scope.total;
          }
        }
      });
    }

    /**
     * Loads the data and triggers any subsequent logic
     */
    function loadData () {
      fetchDataViaApi()
        .then(function () {
          $scope.title = $scope.handlers.title ? $scope.handlers.title($scope.total) : $scope.title;
        });
    }

    /**
     * Prepare the parameters of the request before passing them to the API
     *
     * @return {String}
     */
    function prepareRequestParams () {
      return _.assign({}, $scope.query.params, {
        sequential: 1,
        options: {
          limit: $scope.pagination.size,
          offset: calculatePageOffset()
        }
      });
    }

    /**
     * Process the list of results via the "results" handler (if provided)
     * before storing it
     *
     * @param {Array} results
     * @return {Array}
     */
    function processResults (results) {
      return $scope.handlers.results ? results.map($scope.handlers.results) : results;
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
}(angular, CRM._));
