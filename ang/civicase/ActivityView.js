(function(angular, $, _) {

  function activityView(scope, element, attrs) {
    function loadActivity() {
      if (scope.activity.id) {
        CRM.loadForm(CRM.url('civicrm/activity', {action: 'view', id: scope.activity.id, reset: 1}), {target: $(element).children('div.act-view-container')});
      }
    }
    scope.close = function() {
      delete(scope.activity.id);
      console.log(scope);
    };
    scope.$watch('activity.id', loadActivity);
  }

  angular.module('civicase').directive('civicaseActivityView', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/ActivityView.html',
      link: activityView,
      scope: {
        activity: '=civicaseActivityView'
      }
    };
  });

})(angular, CRM.$, CRM._);
