(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.factory('getActivityFeedUrl', function ($route, $location, $sce) {
    return function (caseId, category, statusType, status, id) {
      caseId = parseInt(caseId, 10);
      var af = {};
      var currentPath = $location.path();
      if (category) {
        af['activity_type_id.grouping'] = category;
      }
      if (statusType) {
        af.status_id = CRM.civicase.activityStatusTypes[statusType];
      }
      if (status) {
        af.status_id = [_.findKey(CRM.civicase.activityStatuses, function (statusObj) {
          return statusObj.name === status;
        })];
      }
      var p = {
        caseId: caseId,
        tab: 'activities',
        aid: id || 0,
        focus: 1,
        sx: 0,
        ai: '{"myActivities":false,"delegated":false}',
        af: JSON.stringify(af)
      };
      // If we're not already viewing a case, force the id filter
      if (currentPath !== '/case/list') {
        p.cf = JSON.stringify({id: caseId});
      } else {
        p = angular.extend({}, $route.current.params, p);
      }

      // The value to mark as trusted in angular context for security.
      return $sce.trustAsResourceUrl('/case/list?' + $.param(p));
    };
  });
})(angular, CRM.$, CRM._, CRM);
