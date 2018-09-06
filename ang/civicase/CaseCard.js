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
    $scope.CRM = CRM;
    $scope.activityFeedUrl = getActivityFeedUrl;

    (function init () {
      countOverdueTasks($scope.data['api.Activity.get'].values);
      countOtherTasks($scope.data.category_count);
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
    function countOtherTasks (categoryCount) {
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

    /**
     * Function to count overdue tasks.
     */
    function countOverdueTasks (activities) {
      $scope.data.category_count.overdue = {};
      _.each(activities, function (val, key) {
        var category = CRM.civicase.activityTypes[val.activity_type_id].grouping;
        if (category) {
          if (moment(val.activity_date_time).isBefore(moment()) && CRM.civicase.activityStatusTypes.incomplete.indexOf(parseInt(val.status_id, 10)) > -1 && CRM.civicase.activityStatusTypes.cancelled.indexOf(parseInt(val.status_id, 10)) === -1) {
            $scope.data.category_count.overdue[category] = $scope.data.category_count.overdue[category] + 1 || 1;
          }
        }
      });
    }
  });
})(angular, CRM.$, CRM._, CRM);
