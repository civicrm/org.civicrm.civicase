(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseBulkActionsCheckboxes', function () {
    return {
      restrict: 'EA',
      controller: 'civicaseBulkActionsController',
      templateUrl: '~/civicase/BulkActionsCheckboxes.html',
      scope: {
        showCheckboxes: '=?',
        selectedItems: '=',
        isSelectAllAvailable: '='
      }
    };
  });

  module.controller('civicaseBulkActionsController', function ($scope, $rootScope) {
    $scope.showCheckboxes = false;

    $scope.$watch('selectedItems', function () {
      $rootScope.$broadcast('stickyCaseListHeaderReinitiatePos');
    });

    /**
     * Toggle checkbox states
     */
    $scope.toggleCheckbox = function () {
      $scope.showCheckboxes = !$scope.showCheckboxes;
    };

    /**
     * Emits event for bulk selections
     * Available event
     * - 'all' : Select all that matches the search
     * - 'visible' :  Selects all visible selections
     * - 'none' : Deselects all
     *
     * @params {String} condition
     */
    $scope.select = function (condition) {
      $scope.$emit('bulkSelection', condition);
    };
  });
})(angular, CRM.$, CRM._);
