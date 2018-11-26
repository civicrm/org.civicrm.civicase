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

  function civicaseActivityActionsController ($scope, crmApi, getActivityFeedUrl, dialogService) {
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

    /**
     * Move/Copy activities
     *
     * @param {Array} activities
     * @param {String} operation
     */
    $scope.moveCopyActivity = function (activities, operation) {
      var activitiesCopy = _.cloneDeep(activities);
      var title = operation[0].toUpperCase() + operation.slice(1) + ((activities.length === 1)
        ? ts(' %1 Activity', {1: activitiesCopy[0].type})
        : ts(' %1 Activities', {1: activitiesCopy.length}));
      var model = {
        ts: ts,
        case_id: activitiesCopy.length > 1 ? '' : activitiesCopy[0].case_id,
        isSubjectVisible: activitiesCopy.length === 1,
        subject: activitiesCopy.length > 1 ? '' : activitiesCopy[0].subject
      };

      dialogService.open('MoveCopyActCard', '~/civicase/ActivityMoveCopy.html', model, {
        autoOpen: false,
        height: 'auto',
        width: '40%',
        title: title,
        buttons: [{
          text: ts('Save'),
          icons: {primary: 'fa-check'},
          click: function () {
            var ifCaseIdIsNew = !_.find(activitiesCopy, function (activity) {
              return activity.case_id === model.case_id;
            });

            if (model.case_id && ifCaseIdIsNew) {
              var apiCalls = [];

              fetchActivitiesInfo(activitiesCopy)
                .then(function (data) {
                  activities = data[0].values;

                  _.each(activities, function (activity) {
                    if (operation === 'copy') {
                      delete activity.id;
                    }
                    if (activities.length === 1) {
                      activity.subject = model.subject;
                    }
                    activity.case_id = model.case_id;
                    apiCalls.push(['Activity', 'create', activity]);
                  });

                  crmApi(apiCalls)
                    .then(function () {
                      $scope.$emit('civicase::activity::updated');
                    });
                });
            }
            $(this).dialog('close');
          }
        }]
      });
    };

    /**
     * Fetch more information about activities
     *
     * @param {Array} activities
     * @return {Promise}
     */
    function fetchActivitiesInfo (activities) {
      var activityIds = activities.map(function (activity) {
        return activity.id;
      });

      return crmApi([['Activity', 'get', {
        sequential: 1,
        return: [
          'subject', 'details', 'activity_type_id', 'status_id',
          'source_contact_name', 'target_contact_name', 'assignee_contact_name',
          'activity_date_time', 'is_star', 'original_id', 'tag_id.name', 'tag_id.description',
          'tag_id.color', 'file_id', 'is_overdue', 'case_id', 'priority_id'
        ],
        id: { 'IN': activityIds }
      }]]);
    }
  }
})(CRM.$, CRM._, angular);
