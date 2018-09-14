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

    (function init () {
      countOtherTasks($scope.data.category_count);
    }());

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

    /**
     * To accumulate non communication and task counts as
     * other count for incomplete as well as completed tasks
     *
     * @param {Object} categoryCount - Object of related categoryCount of a case
     */
    function countOtherTasks (categoryCount) {
      var otherCount;

      _.each(_.keys(categoryCount), function (status) {
        otherCount = 0;

        _.each(_.keys(categoryCount[status]), function (type) {
          if (type !== 'communication' && type !== 'task') {
            otherCount += categoryCount[status][type];
          }
          $scope.data.category_count[status].other = otherCount;
        });
      });
    }
  });
})(angular, CRM.$, CRM._, CRM);
