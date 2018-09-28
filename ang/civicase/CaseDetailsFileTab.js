(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseDetailsFileTab', function () {
    return {
      restrict: 'AE',
      templateUrl: '~/civicase/CaseDetailsFileTab.html',
      scope: {
        item: '=civicaseCaseDetailsFileTab'
      },
      controller: civicaseCaseDetailsFileTabController
    };

    /**
     * Controller function for the directive
     *
     * @param {Object} $scope
     */
    function civicaseCaseDetailsFileTabController ($scope) {
      $scope.ts = CRM.ts('civicase');
    }
  });
})(angular, CRM.$, CRM._);
