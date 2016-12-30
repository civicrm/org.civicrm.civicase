(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
      $routeProvider.when('/activity/feed', {
        controller: 'CivicaseActivityFeed',
        templateUrl: '~/civicase/ActivityFeed.html',

        // If you need to look up data when opening the page, list it out
        // under "resolve".
        resolve: {
          data: function(crmApi) {
            return crmApi({
              activities: ['Activity', 'get', {sequential: 1,
                activity_type_id: {'<' : 4},
                return: ['subject', 'details', 'activity_type_id.label', 'activity_type_id.icon', 'status_id.label', 'target_contact_id', 'assignee_contact_id']
              }]
            });
          }
        }
      });
    }
  );

  // The controller uses *injection*. This default injects a few things:
  //   $scope -- This is the set of variables shared between JS and HTML.
  //   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  angular.module('civicase').controller('CivicaseActivityFeed', function($scope, crmApi, crmStatus, crmUiHelp, data) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/civicase/ActivityFeed'}); // See: templates/CRM/civicase/ActivityFeed.hlp

    // We have data available in JS. We also want to reference in HTML.
    $scope.activities = data.activities.values;

    $scope.save = function save() {};
  });

})(angular, CRM.$, CRM._);
