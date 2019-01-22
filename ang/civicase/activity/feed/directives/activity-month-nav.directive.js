(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityMonthNav', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '~/civicase/activity/feed/directives/activity-month-nav.directive.html'
    };
  });
})(angular, CRM.$, CRM._, CRM);
