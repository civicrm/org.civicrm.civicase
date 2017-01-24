(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
      $routeProvider.when('/activity/feed', {
        controller: 'CivicaseActivityFeed',
        templateUrl: '~/civicase/ActivityFeed.html',
        resolve: {
          data: function(crmApi) {
            return crmApi({
              tags: ['tag', 'get', {options: {limit: 0}, used_for: {LIKE: '%civicrm_activity%'}, return: ['color', 'name', 'description']}],
              statuses: ['optionValue', 'get', {options: {limit: 0, sort: 'weight'}, 'option_group_id': 'activity_status', is_active: 1}],
              types: ['optionValue', 'get', {options: {limit: 0, sort: 'weight'}, 'option_group_id': 'activity_type', is_active: 1}],
              categories: ['optionValue', 'get', {options: {limit: 0, sort: 'weight'}, 'option_group_id': 'activity_category', is_active: 1}]
            });
          }
        }
      });
    }
  );

  // ActivityFeed controller
  angular.module('civicase').controller('CivicaseActivityFeed', function($scope, crmApi, crmStatus, crmUiHelp, crmThrottle, data) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/civicase/ActivityFeed'});
    $scope.CRM = CRM;

    function mapSelectOptions(opt) {
      return {
        id: opt.value,
        text: opt.label,
        color: opt.color,
        icon: opt.icon
      };
    }

    // We have data available in JS. We also want to reference in HTML.
    var activityTypes = $scope.activityTypes = _.indexBy(data.types.values, 'value');
    var activityStatuses = $scope.activityStatuses = _.indexBy(data.statuses.values, 'value');
    var activityCategories = $scope.activityCategories = _.indexBy(data.categories.values, 'value');
    var tags = $scope.tags = data.tags.values;
    $scope.activityTypeOptions = _.map(data.types.values, mapSelectOptions);
    $scope.activityStatusOptions = _.map(data.statuses.values, mapSelectOptions);
    $scope.activities = {};
    $scope.availableFilters = {
      activity_type_id: ts('Activity type'),
      status_id: ts('Status'),
      text: ts('Contains text'),
      target_contact_id: ts('With'),
      assignee_contact_id: ts('Assigned to'),
      tag_id: ts('Tagged')
    };
    if (_.includes(CRM.config.enableComponents, 'CiviCampaign')) {
      $scope.availableFilters.campaign_id = ts('Campaign');
    }

    $scope.filters = {};

    $scope.exposedFilters = CRM.cache.get('activityFeedFilters', {
      activity_type_id: true,
      status_id: true,
      text: true
    });

    var displayOptions = $scope.displayOptions = CRM.cache.get('activityFeedDisplayOptions', {
      followup_nested: true,
      overdue_first: true
    });

    var involving = $scope.involving = {
      myActivities: false,
      delegated: false
    };

    $scope.star = function(act) {
      act.is_star = act.is_star === '1' ? '0' : '1';
      // Setvalue api avoids messy revisioning issues
      crmApi('Activity', 'setvalue', {id: act.id, field: 'is_star', value: act.is_star}, {});
    };

    $scope.markCompleted = function(act) {
      $('.act-feed-panel .panel-body').block();
      crmApi('Activity', 'create', {id: act.id, status_id: act.is_completed ? 'Scheduled' : 'Completed'}, {}).then(getActivities);
    };

    $scope.isSameDate = function(d1, d2) {
      return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
    };

    function formatActivities(values) {
      _.each(values, function(act) {
        act.category = (activityTypes[act.activity_type_id].grouping ? activityTypes[act.activity_type_id].grouping.split(',') : []);
        act.icon = activityTypes[act.activity_type_id].icon;
        act.type = activityTypes[act.activity_type_id].label;
        act.status = activityStatuses[act.status_id].label;
        act.is_completed = activityStatuses[act.status_id].name === 'Completed';
        act.color = activityStatuses[act.status_id].color || '#42afcb';
        if (act.category.indexOf('alert') > -1) {
          act.color = ''; // controlled by css
        }
      });
      return values;
    }

    function getActivities() {
      $('.act-feed-panel .panel-body').block();
      crmThrottle(_loadActivities).then(function(result) {
        $scope.activities = formatActivities(result.values);
        $('.act-feed-panel .panel-body').unblock();
      });
    }

    function _loadActivities() {
      var params = {
        sequential: 1,
        is_current_revision: 1,
        is_deleted: 0,
        return: ['subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name', 'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star', 'original_id', 'tag_id'],
        "api.Attachment.get": {entity_table: 'civicrm_activity'},
        options: {
          sort: 'activity_date_time DESC'
        }
      };
      _.each($scope.filters, function(val, key) {
        if (val) {
          if (key === 'text') {
            params.subject = {LIKE: '%' + val + '%'};
            params.details = {LIKE: '%' + val + '%'};
            params.options.or = [['subject', 'details']];
          }
          else if (key === 'activity_type_id.grouping') {
            params[key] = {LIKE: '%' + val + '%'};
          } else {
            params[key] = {IN: val.split(',')};
          }
        }
      });
      if (involving.myActivities) {
        params.contact_id = 'user_contact_id';
      }
      if (involving.delegated && !params.assignee_contact_id) {
        params.assignee_contact_id = {'!=': 'user_contact_id'};
      }
      return crmApi('Activity', 'get', $.extend(true, returnParams, params));
    }

    $scope.$watchCollection('filters', getActivities);
    $scope.$watchCollection('involving', getActivities);

    $scope.$watchCollection('exposedFilters', function() {
      CRM.cache.set('activityFeedFilters', $scope.exposedFilters);
      _.each($scope.filters, function(val, key) {
        if (val && !$scope.exposedFilters[key]) {
          delete $scope.filters[key];
        }
      });
    });

    $scope.$watchCollection('displayOptions', function() {
      CRM.cache.set('activityFeedDisplayOptions', displayOptions);
      getActivities();
    });

    // Respond to activities edited in popups.
    $('#crm-container').on('crmPopupFormSuccess', '.act-feed-panel', getActivities);

  });

})(angular, CRM.$, CRM._);
