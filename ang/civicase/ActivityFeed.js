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
              statuses: ['optionValue', 'get', {options: {limit: 0}, 'option_group_id': 'activity_status'}],
              types: ['optionValue', 'get', {options: {limit: 0}, 'option_group_id': 'activity_type'}]
            });
          }
        }
      });
    }
  );

  // The controller uses *injection*. This default injects a few things:
  //   $scope -- This is the set of variables shared between JS and HTML.
  //   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  angular.module('civicase').controller('CivicaseActivityFeed', function($scope, crmApi, crmStatus, crmUiHelp, crmThrottle, data) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/civicase/ActivityFeed'});
    $scope.CRM = CRM;

    function makeSelectOptions(opts) {
      var out = [];
      _.each(opts, function(opt) {
        out.push({
          id: opt.value,
          text: opt.label,
          color: opt.color,
          icon: opt.icon
        });
      });
      return out;
    }

    // We have data available in JS. We also want to reference in HTML.
    activityTypes = $scope.activityTypes = _.indexBy(data.types.values, 'value');
    activityStatuses = $scope.activityStatuses = _.indexBy(data.statuses.values, 'value');
    $scope.activityTypeOptions = makeSelectOptions(data.types.values);
    $scope.activityStatusOptions = makeSelectOptions(data.statuses.values);
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

    $scope.star = function star(act) {
      act.is_star = act.is_star === '1' ? '0' : '1';
      crmApi('Activity', 'create', {id: act.id, is_star: act.is_star}, {});
    };

    $scope.isSameDate = function(d1, d2) {
      return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
    };

    function getActivities() {
      $('.panel-body').block();
      crmThrottle(_loadActivities).then(function(result) {
        $scope.activities = result.values;
        $('.panel-body').unblock();
      });
    }

    function _loadActivities() {
      var params = {
        sequential: 1,
        source_contact_id: 'user_contact_id',
        options: {sort: 'activity_date_time DESC'},
        is_current_revision: 1,
        return: ['subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name', 'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star'],
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
      return crmApi('Activity', 'get', params);
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
