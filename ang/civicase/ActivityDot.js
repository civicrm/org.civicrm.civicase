(function (angular, $, _) {

  angular.module('civicase').directive('civicaseActivityDot', function () {
    return {
      restrict: 'A',
      template:
        '<div class="cb-dot" title="{{ activity.type }} ({{ activity.status }})" style="background-color: {{ activity.color }};">' +
        '<i ng-if="activity.icon" class="fa {{ activity.icon }}"></i>' +
        '<strong ng-if="!activity.icon">{{ activity.type[0] }}</strong>' +
        '</div>',
      scope: {
        activity: '=civicaseActivityDot'
      }
    };
  });

})(angular, CRM.$, CRM._);
