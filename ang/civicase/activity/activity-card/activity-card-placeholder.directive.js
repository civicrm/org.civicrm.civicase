(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityCardPlaceholder', function () {
    return {
      templateUrl: '~/civicase/activity/activity-card/activity-card-placeholder.html',
      restrict: 'E'
    };
  });
}(angular));
