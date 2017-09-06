(function(angular, $, _) {

  function activityCard($scope, getActivityFeedUrl, dialogService) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.CRM = CRM;
    $scope.activityFeedUrl = getActivityFeedUrl;

    $scope.isActivityEditable = function(activity) {
      var type = CRM.civicase.activityTypes[activity.activity_type_id].name;
      return (type !== 'Email' && type !== 'Print PDF Letter') && $scope.editActivityUrl;
    };

    $scope.markCompleted = function(act) {
      $scope.refresh([['Activity', 'create', {id: act.id, status_id: act.is_completed ? 'Scheduled' : 'Completed'}]]);
    };

    $scope.deleteActivity = function(activity) {
      CRM.confirm({
          title: ts('Delete Activity'),
          message: ts('Permanently delete this %1 activity?', {1: activity.type})
        })
        .on('crmConfirm:yes', function() {
          $scope.refresh([['Activity', 'delete', {id: activity.id}]]);
        });
    };

    $scope.viewInPopup = function($event, activity) {
      if (!$event || !$($event.target).is('a, a *, input, button')) {
        CRM.loadForm(CRM.url('civicrm/activity', {action: 'view', id: activity.id, reset: 1}))
          .on('crmFormSuccess', function() {
            $scope.refresh();
          });
      }
    };

    $scope.moveCopyActivity = function(act, op) {
      var model = {
        ts: ts,
        activity: _.cloneDeep(act)
      };
      dialogService.open('MoveCopyActCard', '~/civicase/ActivityMoveCopy.html', model, {
        autoOpen: false,
        height: 'auto',
        width: '40%',
        title: op === 'move' ? ts('Move %1 Activity', {1: act.type}) : ts('Copy %1 Activity', {1: act.type}),
        buttons: [{
          text: ts('Save'),
          icons: {primary: 'fa-check'},
          click: function() {
            if (op === 'copy') {
              delete model.activity.id;
            }
            if (model.activity.case_id && model.activity.case_id != act.case_id) {
              $scope.refresh([['Activity', 'create', model.activity]]);
            }
            $(this).dialog('close');
          }
        }]
      });
    };
  }

  angular.module('civicase').directive('caseActivityCard', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/ActivityCard.html',
      controller: activityCard,
      scope: {
        activity: '=caseActivityCard',
        refresh: '=refreshCallback',
        editActivityUrl: '=?editActivityUrl'
      }
    };
  });

})(angular, CRM.$, CRM._);
