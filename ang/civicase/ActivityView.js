(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityView', function () {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/ActivityView.html',
      link: civicaseActivityViewLink,
      scope: {
        activity: '=civicaseActivityView',
        refresh: '=refreshCallback'
      }
    };
  });

  function civicaseActivityViewLink (scope, element, attrs) {
    var ts = CRM.ts('civicase');

    scope.close = function () {
      delete scope.activity.id;
    };

    (function init () {
      scope.$watch('activity.id', loadActivity);
      element.on('crmFormSuccess', scope.refresh);
      element.on('crmLoad', crmLoadListener);
    }());

    function crmLoadListener () {
      // Workaround bug where href="#" changes the angular route
      $('a.crm-clear-link', this).removeAttr('href');
      $('a.delete.button', this).click(function (e) {
        CRM.confirm({
          title: ts('Delete Activity'),
          message: ts('Permanently delete this %1 activity?', {1: scope.activity.type})
        })
          .on('crmConfirm:yes', function () {
            $(element).children('div.act-view-container').block();
            CRM.api3('Activity', 'delete', {id: scope.activity.id})
              .done(scope.close)
              .done(scope.refresh);
          });
        return false;
      });

      if (CRM.checkPerm('basic case information') &&
        !CRM.checkPerm('administer CiviCase') &&
        !CRM.checkPerm('access my cases and activities') &&
        !CRM.checkPerm('access all cases and activities')
      ) {
        $('div.crm-submit-buttons').remove();
      }
    }

    function loadActivity () {
      if (scope.activity.id) {
        var context = scope.activity.case_id ? 'case' : 'activity';

        CRM.loadForm(CRM.url('civicrm/activity', {
          action: 'view',
          id: scope.activity.id,
          reset: 1,
          context: context
        }), {target: $(element).find('div.civicase__activity-feed__details__container')});

        element.find('.crm-submit-buttons a.edit').addClass('btn btn-primary');
      }
    }
  }
})(angular, CRM.$, CRM._);
