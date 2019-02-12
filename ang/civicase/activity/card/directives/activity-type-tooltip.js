(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityTypeTooltip', function ($timeout) {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/activity/card/directives/activity-type-tooltip.directive.html',
      link: caseActivityTypeTooltipLink
    };

    /**
     * Link function for caseActivityTypeTooltip
     *
     * @param {Object} scope
     * @param {Object} $elm
     */
    function caseActivityTypeTooltipLink (scope, $elm) {
      scope.tooltipEnabled = false;

      (function init () {
        $timeout(function () {
          var activityTypeElement = $elm.find('.civicase__activity-type')[0];

          if (activityTypeElement.scrollWidth > activityTypeElement.offsetWidth) {
            scope.tooltipEnabled = true;
          }
        });
      })();
    }
  });
})(angular, CRM.$, CRM._);
