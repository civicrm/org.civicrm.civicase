(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseTabCaseDetails', function () {
    return {
      restrict: 'EA',
      replace: true,
      controller: ContactCaseTabCaseDetailsController,
      templateUrl: '~/civicase/ContactCaseTabCaseDetails.html',
      scope: {
        item: '=selectedCase'
      }
    };
  });

  function ContactCaseTabCaseDetailsController ($scope) {
  }
})(angular, CRM.$, CRM._);
