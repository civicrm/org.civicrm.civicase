(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseCard', function () {
    return {
      templateUrl: function (elem, attrs) {
        switch (attrs.mode) {
          case 'other-case':
            return '~/civicase/case/case-card/case-card-other-cases.directive.html';
          case 'contact-record':
            return '~/civicase/case/case-card/case-card-contact-record.directive.html';
          case 'dashboard':
            return '~/civicase/case/case-card/case-card-dashboard.directive.html';
          default:
            return '~/civicase/case/case-card/case-card-case-list.directive.html';
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
