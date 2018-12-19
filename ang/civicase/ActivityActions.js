(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityActions', function () {
    return {
      scope: {
        mode: '@',
        selectedActivities: '=',
        editActivityUrl: '=?editActivityUrl'
      },
      controller: civicaseActivityActionsController,
      templateUrl: '~/civicase/ActivityActions.html',
      restrict: 'A'
    };
  });

  module.controller('civicaseActivityActionsController', civicaseActivityActionsController);

  function civicaseActivityActionsController ($scope, crmApi, getActivityFeedUrl, MoveCopyActivityAction) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.activityFeedUrl = getActivityFeedUrl;

    $scope.isActivityEditable = function (activity) {
      var type = CRM.civicase.activityTypes[activity.activity_type_id].name;

      return (type !== 'Email' && type !== 'Print PDF Letter') && $scope.editActivityUrl;
    };

    /**
     * Delete activities
     *
     * @param {Array} activities
     * @param {jQuery} dialog - the dialog which should be closed once deletion is over
     */
    $scope.deleteActivity = function (activities, dialog) {
      CRM.confirm({
        title: ts('Delete Activity'),
        message: ts('Permanently delete %1 activit%2?', {1: activities.length, 2: activities.length > 1 ? 'ies' : 'y'})
      }).on('crmConfirm:yes', function () {
        var apiCalls = [];

        _.each(activities, function (activity) {
          apiCalls.push(['Activity', 'delete', {id: activity.id}]);
        });

        crmApi(apiCalls)
          .then(function () {
            $scope.$emit('civicase::activity::updated');
          });

        if (dialog && $(dialog).data('uiDialog')) {
          $(dialog).dialog('close');
        }
      });
    };

    $scope.moveCopyActivity = MoveCopyActivityAction.moveCopyActivities;
  }
})(CRM.$, CRM._, angular);
