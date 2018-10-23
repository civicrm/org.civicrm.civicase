(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicasePanelQuery', function () {
    return {
      restrict: 'E',
      templateUrl: '~/civicase/PanelQuery.html',
      link: linkFn,
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
}(angular));
