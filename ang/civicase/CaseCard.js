(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseCard', function () {
    return {
      templateUrl: function (elem, attrs) {
        switch (attrs.mode) {
          case 'other-case':
            return '~/civicase/CaseCard--other-cases.html';
          case 'contact-record':
            return '~/civicase/CaseCard--contact-record.html';
          case 'dashboard':
            return '~/civicase/CaseCard--dashboard.html';
          default:
            return '~/civicase/CaseCard--case-list.html';
        }
      },
      replace: true,
      scope: {
        data: '=case',
        showContactRole: '='
      },
      controller: 'CivicaseCaseCardController'
    };
  });

  module.controller('CivicaseCaseCardController', function ($scope, getActivityFeedUrl, DateHelper) {
    $scope.activityFeedUrl = getActivityFeedUrl;
    $scope.formatDate = DateHelper.formatDate;
    $scope.otherCategories = _.map(_.filter(CRM.civicase.activityCategories, function (category) {
      return category.name !== 'task' && category.name !== 'communication';
    }), function (category) {
      return category.name;
    });

    /**
     * Update Bulk Actions checkbox of the case card
     */
    $scope.toggleSelected = function () {
      $scope.data.selected = !$scope.data.selected;
      $scope.$emit('civicase::bulk-actions::check-box-toggled', $scope.data);
    };
  });
})(angular, CRM.$, CRM._, CRM);
