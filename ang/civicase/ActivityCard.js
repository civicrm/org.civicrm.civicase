(function(angular, $, _) {

  function activityCard($scope, getActivityFeedUrl) {
    $scope.ts = CRM.ts('civicase');
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
  }

  angular.module('civicase').directive('caseActivityCard', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/ActivityCard.html',
      controller: activityCard,
      scope: {
        activity: '=caseActivityCard',
        refresh: '=refreshCallback',
        item: '=caseItem',
        editActivityUrl: '=?editActivityUrl'
      }
    };
  });

})(angular, CRM.$, CRM._);
