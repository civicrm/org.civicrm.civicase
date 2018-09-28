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

      (function init () {
        initiateBulkActions();
      }());

      /**
       * Initialise the Bulk Actions Functionality
       */
      function initiateBulkActions () {
        if (CRM.checkPerm('basic case information') &&
          !CRM.checkPerm('administer CiviCase') &&
          !CRM.checkPerm('access my cases and activities') &&
          !CRM.checkPerm('access all cases and activities')
        ) {
          $scope.bulkAllowed = false;
        } else {
          $scope.bulkAllowed = true;
        }
      }
    }
  });
})(angular, CRM.$, CRM._);
