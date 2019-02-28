(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseTagsContainer', function ($document) {
    return {
      restrict: 'E',
      replace: true,
      controller: civicaseTagsContainerController,
      templateUrl: '~/civicase/shared/directives/tags-container.directive.html',
      scope: {
        tags: '=',
        showEllipsisAfter: '@'
      }
    };

    /**
     * Controller function
     */
    function civicaseTagsContainerController ($scope) {
      $scope.tagsArray = [];

      (function init () {
        $scope.$watch('tags', function () {
          if ($scope.tags) {
            $scope.tagsArray = Object.values($scope.tags);
          }
        });
      }());
    }
  });
})(angular, CRM.$, CRM._, CRM);
