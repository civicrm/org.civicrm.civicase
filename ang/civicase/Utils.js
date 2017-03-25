(function(angular, $, _) {

  angular.module('civicase').factory('isActivityOverdue', function(crmLegacy) {
    return function(act) {
      var statuses = crmLegacy.civicase.activityStatuses,
        now = new Date();
      return !!act &&
        (['Completed', 'Canceled'].indexOf(statuses[act.status_id].name) < 0) &&
        (crmLegacy.utils.makeDate(act.activity_date_time) < now);
    };
  });

  angular.module('civicase').factory('formatActivity', function(crmLegacy) {
    var activityTypes = CRM.civicase.activityTypes;
    var activityStatuses = CRM.civicase.activityStatuses;
    return function (act) {
      act.category = (activityTypes[act.activity_type_id].grouping ? activityTypes[act.activity_type_id].grouping.split(',') : []);
      act.icon = activityTypes[act.activity_type_id].icon;
      act.type = activityTypes[act.activity_type_id].label;
      act.status = activityStatuses[act.status_id].label;
      act.is_completed = activityStatuses[act.status_id].name === 'Completed';
      act.color = activityStatuses[act.status_id].color || '#42afcb';
      if (act.category.indexOf('alert') > -1) {
        act.color = ''; // controlled by css
      }
    };
  });

})(angular, CRM.$, CRM._);
