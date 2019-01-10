(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseTabCaseDetails', function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '~/civicase/contact-tab/contact-case-tab-case-details.directive.html',
      scope: {
        item: '=selectedCase',
        refreshCases: '=refreshCallback'
      }
    };
  });
})(angular, CRM.$, CRM._);
