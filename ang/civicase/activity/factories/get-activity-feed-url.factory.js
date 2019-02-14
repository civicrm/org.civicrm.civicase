(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.factory('getActivityFeedUrl', function ($route, $location, $sce) {
    return function (urlParams) {
      var activityFilters = {};
      var baseUrl = '#/case/list?';
      var currentPath = $location.path();

      urlParams = urlParams || {};
      urlParams.activityId = urlParams.activityId || 0;

      if (urlParams.category) {
        activityFilters['activity_type_id.grouping'] = urlParams.category;
      }

      if (urlParams.statusType) {
        activityFilters.status_id = CRM.civicase.activityStatusTypes[urlParams.statusType];
      }

      if (urlParams.status) {
        activityFilters.status_id = [_.findKey(CRM.civicase.activityStatuses, function (statusObj) {
          return statusObj.name === urlParams.status;
        })];
      }

      activityFilters = angular.extend(
        {},
        $route.current.params.af || {},
        activityFilters,
        urlParams.filters || {}
      );

      var p = angular.extend({}, $route.current.params, {
        aid: urlParams.activityId,
        focus: 1,
        sx: 0,
        ai: '{"myActivities":false,"delegated":false}',
        af: JSON.stringify(activityFilters)
      });

      if (currentPath !== '/case/list') {
        baseUrl = '#/case?';
        p.dtab = 1;

        // If we're not already viewing a case, force the case id filter
        p.cf = JSON.stringify({ id: urlParams.caseId });
      } else {
        p.tab = 'activities';
      }

      if (urlParams.caseId) {
        p.caseId = parseInt(urlParams.caseId, 10);
      }

      // The value to mark as trusted in angular context for security.
      return $sce.trustAsResourceUrl(baseUrl + $.param(p));
    };
  });
})(angular, CRM.$, CRM._, CRM);
