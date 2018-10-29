(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseDetailsFileTab', function () {
    return {
      restrict: 'AE',
      templateUrl: '~/civicase/CaseDetailsFileTab.html',
      scope: {
        item: '=civicaseCaseDetailsFileTab',
        refresh: '=?refreshCallback'
      },
      controller: civicaseCaseDetailsFileTabController
    };

    /**
     * Controller function for the directive
     *
     * @param {Object} $scope
     */
    function civicaseCaseDetailsFileTabController ($scope, BulkActions) {
      $scope.ts = CRM.ts('civicase');
      $scope.bulkAllowed = BulkActions.isAllowed();
    }
  });
})(angular, CRM.$, CRM._);
