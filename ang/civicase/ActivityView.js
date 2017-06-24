(function(angular, $, _) {

  function activityView(scope, element, attrs) {
    function loadActivity() {
      if (scope.activity.id) {
        CRM.loadForm(CRM.url('civicrm/activity', {action: 'view', id: scope.activity.id, reset: 1}), {target: $(element).children('div.act-view-container')});
      }
    }
    scope.close = function() {
      delete(scope.activity.id);
    };
    scope.$watch('activity.id', loadActivity);

    element.on('crmFormSuccess', scope.refresh);
  }

  angular.module('civicase').directive('civicaseActivityView', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/ActivityView.html',
      link: activityView,
      scope: {
        activity: '=civicaseActivityView',
        refresh: '=refreshCallback'
      }
    };
  });

})(angular, CRM.$, CRM._);
