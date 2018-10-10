(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseBulkActionsMessage', function () {
    return {
      restrict: 'E',
      replace: true,
      controller: 'civicaseBulkActionsController',
      templateUrl: '~/civicase/BulkActionsMessage.html',
      scope: {
        selectedItems: '=',
        isSelectAllAvailable: '=',
        totalCount: '=',
        showCheckboxes: '='
      }
    };
  });
})(angular, CRM.$, CRM._);
