(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('MoveCopyActivityAction', MoveCopyActivityAction);

  function MoveCopyActivityAction ($rootScope, crmApi, dialogService) {
    var ts = CRM.ts('civicase');
    var MOVE_COPY_ACTIVITY_LIMIT = 200;

    /**
     * Move/Copy activities
     *
     * @param {Array} activities
     * @param {String} operation
     */
    this.moveCopyActivities = function (activities, operation) {
      if (ifActivityLimitIsReached(activities)) {
        return;
      }

      var activitiesCopy = _.cloneDeep(activities);
      var title = operation[0].toUpperCase() + operation.slice(1) +
        ((activities.length === 1)
          ? ts(' %1Activity', {1: activitiesCopy[0].type ? activitiesCopy[0].type + ' ' : ''})
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
            moveCopyConfirmationHandler.call(this, operation, activities, activitiesCopy, model);
          }
        }]
      });
    };

    /**
     * Handles the click event when the move/copy operation is confirmed
     *
     * @param {String} operation
     * @param {Array} activities
     * @param {Array} activitiesCopy
     * @param {Object} model
     */
    function moveCopyConfirmationHandler (operation, activities, activitiesCopy, model) {
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
                $rootScope.$emit('civicase::activity::updated');
              });
          });
      }
      $(this).dialog('close');
    }

    /**
     * Check if thesent activities count exceed the allowed limit
     *
     * @param {Array} activities
     * @return {Boolean}
     */
    function ifActivityLimitIsReached (activities) {
      if (activities.length > MOVE_COPY_ACTIVITY_LIMIT) {
        var errorMsg = ts('The maximum number of Activities you can select to move/copy is %1. ' +
          'You have selected %2.' +
          ' Please select fewer Activities from your search results and try again.',
        { 1: MOVE_COPY_ACTIVITY_LIMIT, 2: activities.length });

        CRM.alert(errorMsg, 'Maximum Exceeded', 'error');
        return true;
      }
    }

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
        options: {limit: 0},
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
})(angular, CRM.$, CRM._);
