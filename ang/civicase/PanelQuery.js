(function (angular, _) {
  var module = angular.module('civicase');

  module.directive('civicasePanelQuery', function () {
    return {
      restrict: 'E',
      templateUrl: '~/civicase/PanelQuery.html',
      link: linkFn,
      controller: 'panelQueryCtrl',
      scope: {
        queryData: '<'
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
    $scope.results = [];
    $scope.total = 0;

    (function init () {
      initWatchers();
      verifyData();
      loadData();
    }());

    /**
     * Initializes the directive's watchers
     */
    function initWatchers () {
      // Trigger a refresh when the query params change
      $scope.$watch('queryData.query.params', function (newParams, oldParams) {
        _.isObject(newParams) && loadData();
      }, true);
    }

    /**
     * Loads the data via the api
     */
    function loadData () {
      crmApi({
        get: [ $scope.queryData.query.entity, 'get', prepareRequestParams() ],
        count: [ $scope.queryData.query.entity, 'getcount', $scope.queryData.query.params ]
      })
        .then(function (result) {
          $scope.results = result.get.values;
          $scope.total = result.count;
        });
    }

    /**
     * Prepare the parameters of the request before passing them to the API
     *
     * @return {String}
     */
    function prepareRequestParams () {
      return _.assign({}, $scope.queryData.query.params, {
        sequential: 1
      });
    }

    /**
     * Verifies that the given data has at least the mandatory properties
     *
     * @throws Error
     */
    function verifyData () {
      if (!$scope.queryData.query) {
        throw new Error('You need to provide a `query` object');
      }

      if (!$scope.queryData.query.entity) {
        throw new Error('The `query` object needs to have a `entity` value');
      }
    }
  }
}(angular, CRM._));
