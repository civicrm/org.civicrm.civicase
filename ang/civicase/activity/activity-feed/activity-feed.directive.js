(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityFeed', function () {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/activity/activity-feed/activity-feed.directive.html',
      controller: civicaseActivityFeedController,
      scope: {
        params: '=civicaseActivityFeed',
        showBulkActions: '=',
        caseTypeId: '=',
        refreshCase: '=?refreshCallback'
      }
    };
  });

  module.controller('civicaseActivityFeedController', civicaseActivityFeedController);

  function civicaseActivityFeedController ($scope, $q, BulkActions, crmApi, crmUiHelp, crmThrottle, formatActivity, $rootScope, dialogService, ContactsCache) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var ITEMS_PER_PAGE = 25;
    var caseId = $scope.params ? $scope.params.case_id : null;
    var pageNum = 0;
    var allActivities = [];

    $scope.isLoading = true;
    $scope.activityTypes = CRM.civicase.activityTypes;
    $scope.activityStatuses = CRM.civicase.activityStatuses;
    $scope.activities = {};
    $scope.activityGroups = [];
    $scope.bulkAllowed = $scope.showBulkActions && BulkActions.isAllowed();
    $scope.remaining = true;
    $scope.selectedActivities = [];
    $scope.viewingActivity = {};
    $scope.caseTimelines = $scope.caseTypeId ? _.sortBy(CRM.civicase.caseTypes[$scope.caseTypeId].definition.activitySets, 'label') : [];
    $scope.refreshAll = refreshAll;

    (function init () {
      bindRouteParamsToScope();
      initiateWatchersAndEvents();
    }());

    $scope.findActivityById = function (searchIn, activityID) {
      return _.find(searchIn, { id: activityID });
    };

    /**
     * Toggle Bulk Actions checkbox of the given activity
     */
    $scope.toggleSelected = function (activity) {
      if (!$scope.findActivityById($scope.selectedActivities, activity.id)) {
        $scope.selectedActivities.push($scope.findActivityById(allActivities, activity.id));
      } else {
        _.remove($scope.selectedActivities, { id: activity.id });
      }
    };

    /**
     * Load next set of activities
     */
    $scope.nextPage = function () {
      ++pageNum;
      getActivities(true);
    };

    /**
     * View an activity in details view
     *
     * @param {int} id
     * @param {Event} e
     */
    $scope.viewActivity = function (id, e) {
      if (e && $(e.target).closest('a, button').length) {
        return;
      }
      var act = _.find($scope.activities, {id: id});
      // If the same activity is selected twice, it's a deselection. If the activity doesn't exist, abort.
      if (($scope.viewingActivity && $scope.viewingActivity.id === id) || !act) {
        $scope.viewingActivity = {};
        $scope.aid = 0;
      } else {
        // Mark email read
        if (act.status === 'Unread') {
          var statusId = _.findKey(CRM.civicase.activityStatuses, {name: 'Completed'});
          crmApi('Activity', 'setvalue', {id: act.id, field: 'status_id', value: statusId}).then(function () {
            act.status_id = statusId;
            formatActivity(act);
          });
        }
        $scope.viewingActivity = _.cloneDeep(act);
        $scope.$emit('civicase::activity-card::load-activity-form', $scope.viewingActivity);
        $scope.aid = act.id;
      }
    };

    /**
     * Binds all route parameters to scope
     */
    function bindRouteParamsToScope () {
      $scope.$bindToRoute({ param: 'aid', expr: 'aid', format: 'raw', default: 0 });
      $scope.$bindToRoute({ expr: 'filters', param: 'af', default: {} });
      $scope.$bindToRoute({
        expr: 'displayOptions',
        param: 'ado',
        default: angular.extend({}, {
          followup_nested: true,
          overdue_first: true,
          include_case: true
        }, $scope.params.displayOptions || {})
      });
    }

    /**
     * Bulk Selection Event Listener
     *
     * @params {Object} event
     * @params {String} condition
     */
    function bulkSelectionsListener (event, condition) {
      if (condition === 'none') {
        deselectAllActivities();
      } else if (condition === 'visible') {
        selectDisplayedActivities();
      } else if (condition === 'all') {
        selectEveryActivity();
      }
    }

    /**
     * Deselection of all activities
     */
    function deselectAllActivities () {
      $scope.selectedActivities = [];
    }

    /**
     * Select all Activity
     */
    function selectEveryActivity () {
      $scope.selectedActivities = [];
      $scope.selectedActivities = _.cloneDeep(allActivities);
      selectDisplayedActivities(); // Update the UI model with displayed cases selected;
    }

    /**
     * Select All visible data.
     */
    function selectDisplayedActivities () {
      var isCurrentActivityInSelectedCases;

      _.each($scope.activities, function (activity) {
        isCurrentActivityInSelectedCases = $scope.findActivityById($scope.selectedActivities, activity.id);

        if (!isCurrentActivityInSelectedCases) {
          $scope.selectedActivities.push($scope.findActivityById(allActivities, activity.id));
        }
      });
    }

    /**
     * Groups the activities into Overdue/Future/Past
     *
     * @param {Array} activities
     * @return {Array}
     */
    function groupActivities (activities) {
      var group, overdue, upcoming, past;
      var groups = [];
      var date = new Date();
      var now = CRM.utils.formatDate(date, 'yy-mm-dd') + ' ' + date.toTimeString().slice(0, 8);

      if ($scope.displayOptions.overdue_first) {
        groups.push(overdue = {key: 'overdue', title: ts('Overdue Activities'), activities: []});
      }

      groups.push(upcoming = {key: 'upcoming', title: ts('Future Activities'), activities: []});
      groups.push(past = {key: 'past', title: ts('Past Activities - Prior to Today'), activities: []});
      _.each(activities, function (act) {
        if (act.activity_date_time > now) {
          group = upcoming;
        } else if (overdue && act.is_overdue) {
          group = overdue;
        } else {
          group = past;
        }
        group.activities.push(act);
      });

      return groups;
    }

    /**
     * Fetch additional information about the contacts
     *
     * @param {array} cases
     */
    function fetchContactsData (activities) {
      var contacts = [];

      _.each(activities, function (activity) {
        contacts = contacts.concat(activity.assignee_contact_id);
        contacts = contacts.concat(activity.target_contact_id);

        if (activity['case_id.contacts']) {
          contacts = contacts.concat(activity['case_id.contacts'].map(function (contact) {
            return contact.contact_id;
          }));
        }

        contacts.push(activity.source_contact_id);
      });

      return ContactsCache.add(contacts);
    }

    /**
     * Get all activities
     *
     * @param {Boolean} nextPage
     */
    function getActivities (nextPage) {
      if (nextPage !== true) {
        deselectAllActivities();
        pageNum = 0;
      }

      crmThrottle(loadActivities).then(function (result) {
        var newActivities = _.each(result[0].acts.values, formatActivity);
        allActivities = result[0].all.values;
        var remaining = allActivities.length - (ITEMS_PER_PAGE * (pageNum + 1));

        if (pageNum) {
          $scope.activities = $scope.activities.concat(newActivities);
        } else {
          $scope.activities = newActivities;
        }
        $scope.activityGroups = groupActivities($scope.activities);
        $scope.totalCount = allActivities.length;
        $scope.remaining = remaining > 0 ? remaining : 0;
        if (!allActivities.length && !pageNum) {
          $scope.remaining = false;
        }
        // reset viewingActivity to get latest data
        $scope.viewingActivity = {};
        $scope.viewActivity($scope.aid);
        $scope.isLoading = false;
      });
    }

    /**
     * Load activities.
     *
     * Note: When the filter is set to "My Activities" the action
     * used is `getcontactactivities` instead of `get` since this action
     * properly returns activities that belong to the contact, but have not
     * been delegated to someone else. This query can't be replicated using
     * api params hence the need for a specialized action.
     *
     * @return {Promise}
     */
    function loadActivities () {
      var apiAction = $scope.filters['@involvingContact'] === 'myActivities'
        ? 'getcontactactivities'
        : 'get';
      var returnParams = {
        sequential: 1,
        return: [
          'subject', 'details', 'activity_type_id', 'status_id',
          'source_contact_name', 'target_contact_name', 'assignee_contact_name',
          'activity_date_time', 'is_star', 'original_id', 'tag_id.name', 'tag_id.description',
          'tag_id.color', 'file_id', 'is_overdue', 'case_id', 'priority_id'
        ],
        options: {
          sort: ($scope.displayOptions.overdue_first ? 'is_overdue DESC, ' : '') + 'activity_date_time DESC',
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
      } else if (!$scope.displayOptions.include_case) {
        params.case_id = {'IS NULL': 1};
      } else {
        returnParams.return = returnParams.return.concat(['case_id.case_type_id', 'case_id.status_id', 'case_id.contacts']);
      }

      _.each($scope.filters, function (val, key) {
        if (key[0] === '@') return; // Virtual params.
        if (key === 'activity_type_id' || key === 'activitySet') {
          setActivityTypeIDsFilter(params);
        } else if (val) {
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
        acts: ['Activity', apiAction, $.extend(true, returnParams, params)],
        all: ['Activity', apiAction, $.extend(true, {
          sequential: 1,
          return: ['id'],
          options: { limit: 0 }}, params)] // all activities, also used to get count
      }).then(function (result) {
        return $q.all([
          result,
          fetchContactsData(result.acts.values)
        ]);
      });
    }

    /**
     * Initiate watchers and event handlers
     */
    function initiateWatchersAndEvents () {
      $scope.$watchCollection('filters', getActivities);
      $scope.$watchCollection('displayOptions', getActivities);
      $scope.$watch('params.filters', getActivities, true);
      $scope.$on('updateCaseData', getActivities);
      $rootScope.$on('civicase::activity::updated', refreshAll);
      $scope.$on('civicase::bulk-actions::bulk-selections', bulkSelectionsListener);
      $scope.$on('civicaseAcitivityClicked', function (event, $event, activity) {
        $scope.viewActivity(activity.id, $event);
      });
    }

    /**
     * Refresh Activities
     * If: refreshCase callback is passed to the directive, calls the same
     * Else: Calls crmApi directly
     *
     * @param {Array} apiCalls
     */
    function refreshAll (apiCalls) {
      if (_.isFunction($scope.refreshCase)) {
        $scope.refreshCase(apiCalls);
      } else {
        if (!_.isArray(apiCalls)) {
          apiCalls = [];
        }

        crmApi(apiCalls, true).then(function (result) {
          getActivities(false);
        });
      }
    }

    /**
     * When timeline/activity-set filter is applied,
     * gets the activity type ids from the selected timeline.
     * Also adds those activity types ids with the "Activity Type" filter
     *
     * @param {*} params
     */
    function setActivityTypeIDsFilter (params) {
      var activityTypeIDs = [];

      if ($scope.filters.activitySet) {
        var activitySet = _.find($scope.caseTimelines, function (activitySet) {
          return activitySet.name === $scope.filters.activitySet;
        });

        if (activitySet) {
          _.each(activitySet.activityTypes, function (activityTypeFromSet) {
            activityTypeIDs.push(_.findKey(CRM.civicase.activityTypes, function (activitySet) {
              return activitySet.name === activityTypeFromSet.name;
            }));
          });
        }
      }

      // add activity types ids from the "Activity Type" filter
      if ($scope.filters['activity_type_id']) {
        activityTypeIDs = activityTypeIDs.concat($scope.filters['activity_type_id']);
      }

      if (activityTypeIDs.length) {
        params['activity_type_id'] = {IN: activityTypeIDs};
      }
    }
  }
})(angular, CRM.$, CRM._);
