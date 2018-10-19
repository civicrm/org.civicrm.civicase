(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseDashboardTab', function () {
    return {
      restrict: 'E',
      templateUrl: '~/civicase/DashboardTab.html'
    };
  });
})(angular);
