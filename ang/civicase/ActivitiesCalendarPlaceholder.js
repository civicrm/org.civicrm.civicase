(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivitiesCalendarPlaceholder', function () {
    return {
      templateUrl: '~/civicase/ActivitiesCalendarPlaceholder.html',
      restrict: 'E',
      replace: true
    };
  });
}(angular));
