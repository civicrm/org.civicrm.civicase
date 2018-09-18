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
      countIncompleteOtherTasks($scope.data.category_count);
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
     * Accumulates non communication and task counts as
     * other count for incomplete tasks
     *
     * @param {Object} categoryCount - Object of related categoryCount of a case
     */
    function countIncompleteOtherTasks (categoryCount) {
      var otherCount;

      _.each(_.keys(categoryCount), function (status) {
        if (status === 'incomplete') {
          otherCount = $scope.data.allActivities.filter(function (activity) {
            return CRM.civicase.activityStatusTypes.incomplete.indexOf(parseInt(activity.status_id)) !== -1;
          }).length;

          _.each(_.keys(categoryCount[status]), function (type) {
            if (type === 'communication' || type === 'task') {
              otherCount -= categoryCount[status][type];
            }
            categoryCount[status].other = otherCount;
          });
        }
      });
    }
  });
})(angular, CRM.$, CRM._, CRM);
