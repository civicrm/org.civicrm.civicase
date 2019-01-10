(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivitiesCalendarPlaceholder', function () {
    return {
      templateUrl: '~/civicase/activity/activity-calendar/activities-calendar-placeholder.directive.html',
      restrict: 'E',
      replace: true
    };
  });
}(angular));
