(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityActions', function () {
    return {
      scope: {
        selectedActivities: '='
      },
      controller: civicaseActivityActionsController,
      templateUrl: '~/civicase/ActivityActions.html',
      restrict: 'A'
    };

    function civicaseActivityActionsController ($scope, crmApi) {
      var ts = $scope.ts = CRM.ts('civicase');

      /**
       * Delete an activity
       *
       * @param {object} activity
       * @param {jQuery} dialog - the dialog which should be closed once deletion is over
       */
      $scope.deleteActivity = function (activities, dialog) {
        CRM.confirm({
          title: ts('Delete Activity'),
          message: ts('Permanently delete %1 activit%2?', {1: activities.length, 2: activities.length > 1 ? 'ies' : 'y'})
        }).on('crmConfirm:yes', function () {
          var apiCalls = [];

          _.each(activities, function (activityID) {
            apiCalls.push(['Activity', 'delete', {id: activityID}]);
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
    }
  });
})(CRM.$, CRM._, angular);
