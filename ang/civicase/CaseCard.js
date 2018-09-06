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
    var categoryCount = $scope.data.category_count;
    $scope.CRM = CRM;
    $scope.activityFeedUrl = getActivityFeedUrl;

    (function init () {
      countOtherTasks();
    }());

    /**
     * Function to check if the date is overdue
     *
     * @param {String} date ISO string
     *
     * @return {Boolean} if the date is overdue.
     */
    $scope.isOverdue = function (date) {
      return moment(date).isBefore(moment());
    };

    /**
     * Function to formatDate in correct way
     *
     * @param {String} date ISO string
     *
     * @return {String} the formatted date
     */
    $scope.formatDate = function (date) {
      return moment(date).format('DD/MM/YYYY');
    };

    /**
     * Function to accumulate non communication and task counts as
     * other count for incomplete as well as completed tasks
     */
    function countOtherTasks () {
      _.each(_.keys(categoryCount), function (status) {
        var otherCount = 0;
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
