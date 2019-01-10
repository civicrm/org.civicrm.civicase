(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityActions', function () {
    return {
      scope: {
        mode: '@',
        selectedActivities: '='
      },
      require: '?^civicaseCaseDetails',
      controller: civicaseActivityActionsController,
      templateUrl: '~/civicase/activity/activity-actions/activity-actions.directive.html',
      restrict: 'A',
      link: civicaseActivityActionsLink
    };

    /**
     * Angular JS's link function for the directive civicaseActivityActions
     * @param {Object} $scope
     * @param {Object} attrs
     * @param {Object} element
     * @param {Object} caseDetails
     */
    function civicaseActivityActionsLink ($scope, attrs, element, caseDetails) {
      if (caseDetails) {
        // TODO - Unit test pending
        $scope.isCaseSummaryPage = true;
        $scope.getEditActivityUrl = caseDetails.getEditActivityUrl;
        $scope.getPrintActivityUrl = caseDetails.getPrintActivityUrl;
      }
    }
  });

  module.controller('civicaseActivityActionsController', civicaseActivityActionsController);

  function civicaseActivityActionsController ($window, $scope, crmApi, getActivityFeedUrl, MoveCopyActivityAction, TagsActivityAction) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.getActivityFeedUrl = getActivityFeedUrl;
    $scope.deleteActivity = deleteActivity;
    $scope.moveCopyActivity = MoveCopyActivityAction.moveCopyActivities;
    $scope.manageTags = TagsActivityAction.manageTags;
    $scope.isActivityEditable = isActivityEditable;
    $scope.printReport = printReport;

    /**
     * Print a report for the sent activities
     *
     * @param {Array} selectedActivities
     */
    function printReport (selectedActivities) {
      var url = $scope.getPrintActivityUrl(selectedActivities);

      $window.open(url, '_blank').focus();
    }

    /**
     * Checks if the sent activity is enabled
     *
     * @param {Object} activity
     */
    function isActivityEditable (activity) {
      var activityType = CRM.civicase.activityTypes[activity.activity_type_id].name;
      var nonEditableActivityTypes = [
        'Email',
        'Print PDF Letter'
      ];

      return !_.includes(nonEditableActivityTypes, activityType) && $scope.getEditActivityUrl;
    }

    /**
     * Delete activities
     *
     * @param {Array} activities
     * @param {jQuery} dialog - the dialog which should be closed once deletion is over
     */
    function deleteActivity (activities, dialog) {
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
    }
  }
})(CRM.$, CRM._, angular);
