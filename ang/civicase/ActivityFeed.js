(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
      $routeProvider.when('/activity/feed', {
        controller: 'CivicaseActivityFeed',
        templateUrl: '~/civicase/ActivityFeed.html',

        // If you need to look up data when opening the page, list it out
        // under "resolve".
        resolve: {}
      });
    }
  );

  // The controller uses *injection*. This default injects a few things:
  //   $scope -- This is the set of variables shared between JS and HTML.
  //   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  angular.module('civicase').controller('CivicaseActivityFeed', function($scope, crmApi, crmStatus, crmUiHelp) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/civicase/ActivityFeed'});
    $scope.CRM = CRM;

    // We have data available in JS. We also want to reference in HTML.
    $scope.activities = {};

    $scope.availableFilters = {
      activity_type_id: ts('Activity type'),
      status_id: ts('Status'),
      subject: ts('Subject'),
      details: ts('Details'),
      target_contact_id: ts('With'),
      assignee_contact_id: ts('Assigned to'),
      tag_id: ts('Tagged')
    };
    if (_.includes(CRM.config.enableComponents, 'CiviCampaign')) {
      $scope.availableFilters.campaign_id = ts('Campaign');
    }

    $scope.filters = {};

    $scope.exposedFilters = {
      activity_type_id: true,
      status_id: true
    };

    $scope.star = function star() {
      console.log(this);
    };

    $scope.isSameDate = function(d1, d2) {
      return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
    };

    function getActivities() {
      var params = {
        sequential: 1,
        source_contact_id: 'user_contact_id',
        options: {sort: 'activity_date_time DESC'},
        return: ['subject', 'details', 'activity_type_id', 'activity_type_id.label', 'activity_type_id.icon', 'status_id.label', 'status_id.color', 'source_contact_name', 'target_contact_name', 'assignee_contact_name', 'activity_date_time'],
        "api.EntityTag.get": {entity_table: 'civicrm_activity', return: ['tag_id.name', 'tag_id.color', 'tag_id.description']},
        "api.Attachment.get": {entity_table: 'civicrm_activity'}
      };
      _.each($scope.filters, function(val, key) {
        if (val) {
          if (key === 'subject' || key === 'details') {
            params[key] = {LIKE: '%' + val + '%'};
          } else {
            params[key] = {IN: val.split(',')};
          }
        }
      });
      crmApi('Activity', 'get', params).then(function(result) {
        $scope.activities = result.values;
      });
    }

    $scope.$watchCollection('filters', getActivities);

    $scope.$watchCollection('exposedFilters', function() {
      _.each($scope.filters, function(val, key) {
        if (val && !$scope.exposedFilters[key]) {
          delete $scope.filters[key];
        }
      });
    });

    // Respond to activities edited in popups.
    // Fixme - properly scope event listner
    $('#crm-container').on('crmPopupFormSuccess', getActivities);

  });

})(angular, CRM.$, CRM._);
