(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityCardPlaceholder', function () {
    return {
      templateUrl: '~/civicase/activity/card/directives/activity-card-placeholder.html',
      restrict: 'E'
    };
  });
}(angular));
