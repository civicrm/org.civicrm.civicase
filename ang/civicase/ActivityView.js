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

    element
      .on('crmFormSuccess', scope.refresh)
      .on('crmLoad', function() {
        // Workaround bug where href="#" changes the angular route
        $('a.crm-clear-link', this).removeAttr('href');
        $('a.delete.button', this).click(function(e) {
          CRM.confirm({
              title: ts('Delete Activity'),
              message: ts('Permanently delete this %1 activity?', {1: scope.activity.type})
            })
            .on('crmConfirm:yes', function() {
              $(element).children('div.act-view-container').block();
              CRM.api3('Activity', 'delete', {id: scope.activity.id})
                .done(scope.close)
                .done(scope.refresh);
            });
          return false;
        });
      });
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
