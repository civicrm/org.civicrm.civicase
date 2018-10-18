(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCase', function () {
    return {
      restrict: 'EA',
      controller: CivicaseContactCaseController,
      templateUrl: '~/civicase/ContactCase.html',
      scope: {
        'caseType': '=',
        'pagerSize': '=',
        'viewingCase': '='
      }
    };
  });

  function CivicaseContactCaseController ($scope, $rootScope, crmApi) {
    $scope.checkPerm = CRM.checkPerm;
    $scope.ts = CRM.ts('civicase');

    (function init () {
      getTotalCases();
    }());

    /**
     * refresh function to set refresh cases
     */
    $scope.refresh = function () {
      $scope.$emit('civicase::contact-record-case::refresh-cases');
    };

    /**
     * Fetches count of all the cases a contact have
     */
    function getTotalCases () {
      var countAPI = [['Case', 'getcount', {
        'contact_id': getSelectedUserId()
      }]];

      crmApi(countAPI).then(function (res) {
        $scope.totalResults = res[0];
      });
    }

    /**
     * Gets user id of the contact's page visited
     *
     * @return {String} user id if user is not selected then current logged in user id
     */
    function getSelectedUserId () {
      var url = new URL(window.location.href);

      return url.searchParams.get('cid') !== null ? url.searchParams.get('cid') : CRM.config.user_contact_id;
    }
  }
})(angular, CRM.$, CRM._);
