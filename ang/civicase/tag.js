(function (angular, colorContrast) {
  var module = angular.module('civicase');

  module.directive('civicaseTag', function () {
    return {
      restrict: 'AE',
      scope: {
        tag: '=civicaseTag'
      },
      controller: 'civicaseTagController',
      templateUrl: '~/civicase/tag.html'
    };
  });

  module.controller('civicaseTagController', function ($scope) {
    $scope.defaultColour = '#0071bd';
    $scope.textColour = colorContrast($scope.tag['tag_id.color'] || $scope.defaultColour);
  });
})(angular, CRM.utils.colorContrast);
