(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityCardPlaceholder', function ($timeout, $uibPosition) {
    return {
      templateUrl: '~/civicase/ActivityCardPlaceholder.html',
      restrict: 'E'
    };
  });
}(angular));
