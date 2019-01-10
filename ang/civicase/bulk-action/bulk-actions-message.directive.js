(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseBulkActionsMessage', function () {
    return {
      restrict: 'EA',
      controller: 'civicaseBulkActionsController',
      templateUrl: '~/civicase/bulk-action/bulk-actions-message.directive.html',
      scope: {
        selectedItems: '=',
        isSelectAllAvailable: '=',
        totalCount: '=',
        showCheckboxes: '='
      }
    };
  });
})(angular, CRM.$, CRM._);
