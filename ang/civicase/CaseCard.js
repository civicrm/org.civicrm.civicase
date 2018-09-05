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

  module.controller('CivicaseCaseCardController', function ($scope) {
    $scope.CRM = CRM;
    var categoryCount = $scope.data.category_count;

    countOtherTasks();

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
     * Function to accumulate non communication and task counts as
     * other count for incomplete as well as completed tasks
     */
    function countOtherTasks () {
      Object.keys(categoryCount).forEach(function (status) {
        var otherCount = 0;

        Object.keys(categoryCount[status]).forEach(function (type) {
          if (type !== 'communication' && type !== 'task') {
            otherCount += categoryCount[status][type];
          }
          $scope.data.category_count[status].other = otherCount;
        });
      });
    }
  });
})(angular, CRM.$, CRM._, CRM);
