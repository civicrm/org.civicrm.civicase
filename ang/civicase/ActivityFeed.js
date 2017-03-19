(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/activity/feed', {
      controller: 'CivicaseActivityFeed',
      template: '<div id="bootstrap-theme" civicase-activity-feed></div>'
    });
  });

  // ActivityFeed route controller
  angular.module('civicase').controller('CivicaseActivityFeed', function($scope) {

  });

  // ActivityFeed directive controller
  function activityFeedController($scope, crmApi, crmUiHelp, crmThrottle) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/civicase/ActivityFeed'});
    var ITEMS_PER_PAGE = 25,
      caseId = $scope.params ? $scope.params.case_id : null,
      pageNum = 0;
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
    var activityTypes = $scope.activityTypes = CRM.civicase.activityTypes;
    var activityStatuses = $scope.activityStatuses = CRM.civicase.activityStatuses;
    $scope.activityCategories = CRM.civicase.activityCategories;
    $scope.activityTypeOptions = _.map(activityTypes, mapSelectOptions);
    $scope.activityStatusOptions = _.map(activityStatuses, mapSelectOptions);
    $scope.activities = {};
    $scope.remaining = true;
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

    $scope.nextPage = function() {
      ++pageNum;
      getActivities(true);
    };

    $scope.getAttachments = function(activity) {
      if (!activity.attachments) {
        activity.attachments = [];
        CRM.api3('Attachment', 'get', {
          entity_table: 'civicrm_activity',
          entity_id: activity.id,
          sequential: 1
        }).done(function(data) {
          activity.attachments = data.values;
          $scope.$digest();
        });
      }
    };

    function formatActivity(act) {
      act.category = (activityTypes[act.activity_type_id].grouping ? activityTypes[act.activity_type_id].grouping.split(',') : []);
      act.icon = activityTypes[act.activity_type_id].icon;
      act.type = activityTypes[act.activity_type_id].label;
      act.status = activityStatuses[act.status_id].label;
      act.is_completed = activityStatuses[act.status_id].name === 'Completed';
      act.color = activityStatuses[act.status_id].color || '#42afcb';
      if (act.category.indexOf('alert') > -1) {
        act.color = ''; // controlled by css
      }
    }

    function getActivities(nextPage) {
      $('.act-feed-panel .panel-body').block();
      if (nextPage !== true) {
        pageNum = 0;
      }
      crmThrottle(_loadActivities).then(function(result) {
        var newActivities = _.each(result.acts.values, formatActivity);
        if (pageNum) {
          $scope.activities = $scope.activities.concat(newActivities);
        } else {
          $scope.activities = newActivities;
        }
        var remaining = result.count - (ITEMS_PER_PAGE * (pageNum + 1));
        $scope.totalCount = result.count;
        $scope.remaining = remaining > 0 ? remaining : 0;
        if (!result.count && !pageNum) {
          $scope.remaining = false;
        }
        $('.act-feed-panel .panel-body').unblock();
      });
    }

    function _loadActivities() {
      var returnParams = {
        sequential: 1,
        return: ['subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name', 'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star', 'original_id', 'tag_id.name', 'tag_id.description', 'tag_id.color', 'file_id'],
        options: {
          sort: 'activity_date_time DESC',
          limit: ITEMS_PER_PAGE,
          offset: ITEMS_PER_PAGE * pageNum
        }
      };
      var params = {
        is_current_revision: 1,
        is_deleted: 0,
        case_id: caseId ? caseId : {'IS NOT NULL': 1},
        options: {}
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
          } else if (typeof val === 'string') {
            params[key] = {IN: val.split(',')};
          } else {
            params[key] = val;
          }
        }
      });
      if (involving.myActivities) {
        params.contact_id = 'user_contact_id';
      }
      if (involving.delegated && !params.assignee_contact_id) {
        params.assignee_contact_id = {'!=': 'user_contact_id'};
      }
      return crmApi({
        acts: ['Activity', 'get', $.extend(true, returnParams, params)],
        count: ['Activity', 'getcount', params]
      });
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

  }

  angular.module('civicase').directive('civicaseActivityFeed', function() {
    return {
      restrict: 'A',
      template:
        '<div class="panel panel-default act-feed-panel">' +
          '<div class="panel-header" ng-include="\'~/civicase/ActivityFilters.html\'"></div>' +
          '<div class="panel-body" ng-include="\'~/civicase/ActivityList.html\'"></div>' +
        '</div>',
      controller: activityFeedController,
      scope: {
        params: '=civicaseActivityFeed'
      }
    };
  });

})(angular, CRM.$, CRM._);
