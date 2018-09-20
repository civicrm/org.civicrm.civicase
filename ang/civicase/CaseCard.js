(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseCard', function () {
    return {
      templateUrl: '~/civicase/CaseCard.html',
      replace: true,
      scope: {
        data: '=case'
      },
      controller: 'CivicaseCaseCardController'
    };
  });

  module.controller('CivicaseCaseCardController', function ($scope, getActivityFeedUrl) {
    $scope.activityFeedUrl = getActivityFeedUrl;

    /**
     * To check if the date is overdue
     *
     * @param {String} date ISO string
     * @return {Boolean} if the date is overdue.
     */
    $scope.isOverdue = function (date) {
      return moment(date).isBefore(moment());
    };

    /**
     * Formats Date in correct format (DD/MM/YYYY)
     *
     * @param {String} date ISO string
     * @return {String} the formatted date
     */
    $scope.formatDate = function (date) {
      return moment(date).format('DD/MM/YYYY');
    };
  });
})(angular, CRM.$, CRM._, CRM);
