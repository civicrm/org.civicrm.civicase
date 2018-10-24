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
    $scope.handlers = $scope.handlers || {};
    $scope.results = [];
    $scope.title = '---';
    $scope.total = 0;

    (function init () {
      initWatchers();
      verifyData();

      loadData();
    }());

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
      // Trigger a refresh when the query params change
      $scope.$watch('query.params', function (newParams, oldParams) {
        _.isObject(newParams) && loadData();
      }, true);
    }

    /**
     * Loads the data and triggers any triggers any subsequent logic
     *
     * @return {Promise}
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
        sequential: 1
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
