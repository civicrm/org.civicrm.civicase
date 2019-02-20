(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityTitleTooltip', function ($timeout) {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/activity/directives/activity-title-tooltip.directive.html',
      link: caseActivityTitleTooltipLink,
      scope: {
        activity: '='
      }
    };

    /**
     * Link function for caseActivityTitleTooltip
     *
     * @param {Object} scope
     * @param {Object} $elm
     */
    function caseActivityTitleTooltipLink (scope, $elm) {
      scope.tooltipEnabled = false;
      scope.isFileUploadTypeActivity = scope.activity.type === 'File Upload';
      scope.getTitleToolTip = getTitleToolTip;

      (function init () {
        $timeout(function () {
          var activityTitleElement = $elm.find('.civicase__activity-type')[0] ||
            $elm.find('.civicase__activity-subject')[0];

          if (activityTitleElement.scrollWidth > activityTitleElement.offsetWidth) {
            scope.tooltipEnabled = true;
          }
        });
      })();

      /**
       * Get the tooltip text
       *
       * @return {String}
       */
      function getTitleToolTip () {
        var tooltipText = scope.isFileUploadTypeActivity
          ? (scope.activity.subject || scope.activity.type)
          : scope.activity.type;

        return tooltipText;
      }
    }
  });
})(angular, CRM.$, CRM._);
