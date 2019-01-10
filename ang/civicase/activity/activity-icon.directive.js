(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('activityIcon', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '~/civicase/activity/activity-icon.directive.html',
      scope: {
        activity: '=activityIcon'
      },
      link: activityIconLink
    };

    /**
     * Link function for activityIcon directive
     *
     * @param {object} scope
     * @param {object} elem
     * @param {object} attrs
     */
    function activityIconLink (scope, elem, attrs) {
      var activityTypes = CRM.civicase.activityTypes;
      var activityType = activityTypes[scope.activity.activity_type_id];

      // Set direction icon for inbound/outbound email
      scope.direction = null;
      if (activityType.name === 'Email') {
        scope.direction = 'up';
      } else if (activityType.name === 'Inbound Email') {
        scope.direction = 'down';
      }
    }
  });
})(angular, CRM.$, CRM._, CRM);
