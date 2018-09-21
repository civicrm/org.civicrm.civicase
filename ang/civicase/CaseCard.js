(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseCard', function () {
    return {
      templateUrl: function (elem, attrs) {
        return attrs.mode === 'other-case' ? '~/civicase/CaseCard--other-cases.html' : '~/civicase/CaseCard--case-list.html';
      },
      replace: true,
      scope: {
        data: '=case'
      },
      controller: 'CivicaseCaseCardController'
    };
  });

  module.controller('CivicaseCaseCardController', function ($scope, getActivityFeedUrl, DateHelper) {
    $scope.activityFeedUrl = getActivityFeedUrl;
    $scope.isOverdue = DateHelper.isOverdue;
    $scope.formatDate = DateHelper.formatDate;
  });
})(angular, CRM.$, CRM._, CRM);
