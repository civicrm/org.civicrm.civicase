(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/activity/feed', {
      reloadOnSearch: false,
      template: '<div id="bootstrap-theme" class="civicase-main" civicase-activity-feed="{}"></div>'
    });
  });

  // ActivityFeed directive controller
  function activityFeedController($scope, crmApi, crmUiHelp, crmThrottle, formatActivity, isActivityOverdue, $rootScope) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/civicase/ActivityFeed'});
    var ITEMS_PER_PAGE = 25,
      caseId = $scope.params ? $scope.params.case_id : null,
      pageNum = 0;
    $scope.CRM = CRM;

    var activityTypes = $scope.activityTypes = CRM.civicase.activityTypes;
    var activityStatuses = $scope.activityStatuses = CRM.civicase.activityStatuses;
    $scope.activityCategories = CRM.civicase.activityCategories;
    $scope.activities = {};
    $scope.remaining = true;
    $scope.viewingActivity = {};
    $scope.$bindToRoute({
      param: 'aid',
      expr: 'aid',
      format: 'raw',
      default: 0
    });
    $scope.$bindToRoute({
      expr: 'displayOptions',
      param: 'ado',
      default: angular.extend({}, {
        followup_nested: true,
        overdue_first: true,
        include_case: true
      }, $scope.params.displayOptions || {})
    });
    $scope.$bindToRoute({
      expr: 'filters',
      param: 'af',
      default: {}
    });

    $scope.refreshCase = $scope.refreshCase || _.noop;
    $scope.refreshAll = function() {
      getActivities(false, $scope.refreshCase);
    };

    $scope.star = function(act) {
      act.is_star = act.is_star === '1' ? '0' : '1';
      // Setvalue api avoids messy revisioning issues
      crmApi('Activity', 'setvalue', {id: act.id, field: 'is_star', value: act.is_star}, {});
    };

    $scope.markCompleted = function(act) {
      $('.act-feed-panel .panel-body').block();
      crmApi('Activity', 'create', {id: act.id, status_id: act.is_completed ? 'Scheduled' : 'Completed'}, {}).then($scope.refreshAll);
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

    $scope.viewActivity = function(id, e) {
      if (e && $(e.target).closest('a, button').length) {
        return;
      }
      var act = _.find($scope.activities, {id: id});
      // If the same activity is selected twice, it's a deselection. If the activity doesn't exist, abort.
      if (($scope.viewingActivity && $scope.viewingActivity.id == id) || !act) {
        $scope.viewingActivity = {};
        $scope.aid = 0;
      } else {  
        // Mark email read
        if (act.status === 'Unread') {
          var statusId = _.findKey(CRM.civicase.activityStatuses, {name: 'Completed'});
          crmApi('Activity', 'setvalue', {id: act.id, field: 'status_id', value: statusId}).then(function() {
            act.status_id = statusId;
            formatActivity(act);
          });
        }
        $scope.viewingActivity = _.cloneDeep(act);
        $scope.aid = act.id;
      }
    };

    $scope.activityGroups = function() {
      var groups = [], group, subgroup,
        date = new Date(),
        now = CRM.utils.formatDate(date, 'yy-mm-dd') + ' ' + date.toTimeString().slice(0, 8),
        overdue, upcoming, past;
      if ($scope.displayOptions.overdue_first) {
        groups.push(overdue = {key: 'overdue', title: ts('Overdue Activities'), activities: []});
      }
      groups.push(upcoming = {key: 'upcoming', title: ts('Upcoming Activities'), activities: []});
      groups.push(past = {key: 'past', title: ts('Past Activities'), activities: []});
      _.each($scope.activities, function(act) {
        var activityDate = act.activity_date_time.slice(0, 10);
        if (act.activity_date_time > now) {
          group = upcoming;
        } else if (overdue && isActivityOverdue(act)) {
          group = overdue;
        } else {
          group = past;
        }
        subgroup = _.findWhere(group.activities, {date: activityDate});
        if (!subgroup) {
          group.activities.push(subgroup = {date: activityDate, activities: []});
        }
        subgroup.activities.push(act);
      });
      return groups;
    };

    function getActivities(nextPage, callback) {
      $('.act-feed-panel .panel-body').block();
      if (nextPage !== true) {
        pageNum = 0;
      }
      crmThrottle(_loadActivities).then(function(result) {
        if (_.isFunction(callback)) {
          callback();
        }
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
        if ($scope.aid && $scope.aid !== $scope.viewingActivity.id) {
          $scope.viewActivity($scope.aid);
        }
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
        is_test: 0,
        options: {}
      };
      if (caseId) {
        params.case_id = caseId;
      }
      else {
        if (!$scope.displayOptions.include_case) {
          params.case_id = {'IS NULL': 1};
        }
      }
      _.each($scope.filters, function(val, key) {
        if (key[0] === '@') return; // Virtual params.
        if (val) {
          if (key === 'text') {
            params.subject = {LIKE: '%' + val + '%'};
            params.details = {LIKE: '%' + val + '%'};
            params.options.or = [['subject', 'details']];
          } else if (_.isString(val)) {
            params[key] = {LIKE: '%' + val + '%'};
          } else if (_.isArray(val) && val.length) {
            params[key] = val.length === 1 ? val[0] : {IN: val};
          } else if (!_.isArray(val)) {
            params[key] = val;
          }
        }
      });
      $rootScope.$broadcast('civicaseActivityFeed.query', $scope.filters, params);
      if ($scope.params && $scope.params.filters) {
        angular.extend(params, $scope.params.filters);
      }
      return crmApi({
        acts: ['Activity', 'get', $.extend(true, returnParams, params)],
        count: ['Activity', 'getcount', params]
      });
    }

    $scope.$watchCollection('filters', getActivities);
    $scope.$watchCollection('params.filters', getActivities);

    $scope.$watchCollection('displayOptions', function() {
      getActivities();
    });

  }

  angular.module('civicase').directive('civicaseActivityFeed', function() {
    return {
      restrict: 'A',
      template:
        '<div class="panel panel-default act-feed-panel">' +
          '<div class="panel-header" civicase-activity-filters="filters"></div>' +
          '<div class="panel-body clearfix" ng-include="\'~/civicase/ActivityList.html\'"></div>' +
        '</div>',
      controller: activityFeedController,
      scope: {
        params: '=civicaseActivityFeed',
        refreshCase: '=?refreshCallback'
      }
    };
  });

})(angular, CRM.$, CRM._);
