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
    $scope.data.selected = $scope.data.selected || false;

    $scope.activityFeedUrl = getActivityFeedUrl;
    $scope.formatDate = DateHelper.formatDate;
    $scope.otherCategories = _.map(_.filter(CRM.civicase.activityCategories, function (category) {
      return category.name !== 'task' && category.name !== 'communication';
    }), function (category) {
      return category.name;
    });

    /**
     * Update the checkbox the case card
     */
    $scope.toggleSelected = function () {
      $scope.data.selected = !$scope.data.selected;
      $scope.$emit('bulkSelectionCheckboxClicked', $scope.data);
    };
  });
})(angular, CRM.$, CRM._, CRM);
