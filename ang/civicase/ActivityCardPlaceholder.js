(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityCardPlaceholder', function () {
    return {
      templateUrl: '~/civicase/ActivityCardPlaceholder.html',
      restrict: 'E'
    };
  });
}(angular));
