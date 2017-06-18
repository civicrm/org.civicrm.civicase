(function(angular, $, _) {

  // CaseList directive controller
  function caseViewController($scope, crmApi, isActivityOverdue, formatActivity, $route) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = $scope.caseStatuses = CRM.civicase.caseStatuses;
    var activityTypes = $scope.activityTypes = CRM.civicase.activityTypes;
    $scope.isActivityOverdue = isActivityOverdue;
    $scope.CRM = CRM;
    $scope.item = null;
    $scope.caseGetParams = function() {
      return JSON.stringify(caseGetParams());
    };

    function caseGetParams() {
      return {
        id: $scope.caseId,
        return: ['subject', 'contact_id', 'case_type_id', 'status_id', 'contacts', 'start_date', 'end_date', 'is_deleted', 'activity_summary', 'unread_email_count', 'activity_count', 'tag_id.name', 'tag_id.color', 'tag_id.description', 'related_case_ids'],
        // Related cases by contact
        'api.Case.get.1': {
          contact_id: {IN: "$value.contact_id"},
          id: {"!=": "$value.id"},
          is_deleted: 0,
          return: ['case_type_id', 'start_date', 'end_date', 'status_id', 'contacts']
        },
        // Linked cases
        'api.Case.get.2': {
          id: {IN: "$value.related_case_ids"},
          is_deleted: 0,
          return: ['case_type_id', 'start_date', 'end_date', 'status_id', 'contacts']
        },
        // For the "recent communication" panel
        'api.Activity.get.1': {
          case_id: "$value.id",
          is_current_revision: 1,
          is_test: 0,
          "activity_type_id.grouping": {LIKE: "%communication%"},
          status_id: 'Completed',
          options: {limit: 5, sort: 'activity_date_time DESC'},
          return: ['activity_type_id', 'subject', 'activity_date_time', 'status_id', 'target_contact_name', 'assignee_contact_name']
        },
        // For the "tasks" panel
        'api.Activity.get.3': {
          case_id: "$value.id",
          is_current_revision: 1,
          is_test: 0,
          "activity_type_id.grouping": {LIKE: "%task%"},
          status_id: {'!=': 'Completed'},
          options: {limit: 5, sort: 'activity_date_time ASC'},
          return: ['activity_type_id', 'subject', 'activity_date_time', 'status_id', 'assignee_contact_name']
        },
        // Custom data
        'api.CustomValue.gettree': {
          entity_id: "$value.id",
          entity_type: 'Case',
          return: ['custom_group.name', 'custom_group.title', 'custom_group.collapse_display', 'custom_field.name', 'custom_field.label', 'custom_value.display']
        },
        sequential: 1,
        options: {
          categories: {alert: 10, milestone: 1, task: 1}
        }
      };
    }

    function getAllowedCaseStatuses(definition) {
      var ret = _.cloneDeep(caseStatuses);
      if (definition.statuses && definition.statuses.length) {
        _.each(_.cloneDeep(ret), function(status, id) {
          if (definition.statuses.indexOf(status.name) < 0) {
            delete(ret[id]);
          }
        });
      }
      return ret;
    }

    function getAvailableActivityTypes(activityCount, definition) {
      var ret = [];
      _.each(definition.activityTypes, function(actSpec) {
        var actTypeId = _.findKey(activityTypes, {name: actSpec.name});
        if (!actSpec.max_instances || !activityCount[actTypeId] || (actSpec.max_instances < activityCount[actTypeId])) {
          ret.push($.extend({id: actTypeId}, activityTypes[actTypeId]));
        }
      });
      return _.sortBy(ret, 'label');
    }

    $scope.tabs = [
      {name: 'summary', label: ts('Summary')},
      {name: 'activities', label: ts('Activities')},
      {name: 'people', label: ts('People')},
      {name: 'files', label: ts('Files')}
    ];

    $scope.selectTab = function(tab) {
      $scope.activeTab = tab;
      if (typeof $scope.isFocused === 'boolean') {
        $scope.isFocused = true;
      }
    };

    function formatCaseDetails(item) {
      $scope.formatCase(item);
      item.definition = caseTypes[item.case_type_id].definition;
      item.relatedCases = _.each(_.cloneDeep(item['api.Case.get.1'].values), $scope.formatCase);
      // Add linked cases
      _.each(_.cloneDeep(item['api.Case.get.2'].values), function(linkedCase) {
        var existing = _.find(item.relatedCases, {id: linkedCase.id});
        if (existing) {
          existing.is_linked = true;
        } else {
          linkedCase.is_linked = true;
          item.relatedCases.push($scope.formatCase(linkedCase));
        }
      });
      delete(item['api.Case.get.1']);
      delete(item['api.Case.get.2']);
      // Format activities
      _.each(item.activity_summary, function(acts) {
        _.each(acts, formatActivity);
      });
      // Recent communications
      item.recentCommunication = _.each(_.cloneDeep(item['api.Activity.get.1'].values), formatActivity);
      delete(item['api.Activity.get.1']);
      // Tasks
      item.tasks = _.each(_.cloneDeep(item['api.Activity.get.3'].values), formatActivity);
      delete(item['api.Activity.get.3']);
      // Custom fields
      item.customData = item['api.CustomValue.gettree'].values || [];
      delete(item['api.CustomValue.gettree']);
      return item;
    }

    $scope.gotoCase = function(id, $event) {
      if ($event && $($event.target).is('.btn-group *')) {
        return;
      }
      var p = angular.extend({}, $route.current.params, {caseId: id});
      $route.updateParams(p);
    };

    $scope.pushCaseData = function(data) {
      if (!$scope.item) $scope.item = {};
      var item = $scope.item;
      // This way the maintain the reference to the variable in the parent scope.
      _.assign(item, formatCaseDetails(data));
      $scope.allowedCaseStatuses = getAllowedCaseStatuses(item.definition);
      $scope.availableActivityTypes = getAvailableActivityTypes(item.activity_count, item.definition);
    };

    $scope.refresh = function(apiCalls) {
      if (!_.isArray(apiCalls)) apiCalls = [];
      apiCalls.push(['Case', 'getdetails', caseGetParams()]);
      crmApi(apiCalls, true).then(function(result) {
        $scope.pushCaseData(result[apiCalls.length - 1].values[0]);
      });
    };

    // Create activity when changing case subject
    $scope.onChangeSubject = function(newSubject) {
      CRM.api3('Activity', 'create', {
        case_id: $scope.caseId,
        activity_type_id: 'Change Case Subject',
        subject: newSubject,
        status_id: 'Completed'
      })
    };

    $scope.markCompleted = function(act) {
      crmApi('Activity', 'create', {id: act.id, status_id: act.is_completed ? 'Scheduled' : 'Completed'}, {});
      $scope.item.tasks.splice(_.findIndex($scope.item.tasks, {id: act.id}), 1);
    };

    $scope.getActivityType = function(name) {
      return _.findKey(activityTypes, {name: name});
    };

    $scope.addTimeline = function(name) {
      $scope.refresh([['Case', 'addtimeline', {case_id: $scope.item.id, 'timeline': name}]]);
    };

    // Copied from ActivityList.js - used by the Recent Communication panel
    $scope.isSameDate = function(d1, d2) {
      return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
    };

    $scope.$watch('caseId', function() {
      // Fetch extra info about the case
      if ($scope.caseId && (!$scope.item || !$scope.item.definition)) {
        crmApi('Case', 'getdetails', caseGetParams()).then(function (info) {
          $scope.pushCaseData(info.values[0]);
        });
      }
    });
  }

  angular.module('civicase').directive('civicaseView', function() {
    return {
      restrict: 'A',
      template:
        '<div class="panel panel-default civicase-view-panel">' +
          '<div class="panel-header" ng-if="item" ng-include="\'~/civicase/CaseViewHeader.html\'"></div>' +
          '<div class="panel-body" ng-if="item" ng-include="\'~/civicase/CaseTabs.html\'"></div>' +
        '</div>',
      controller: caseViewController,
      scope: {
        caseId: '=civicaseView',
        activeTab: '=civicaseTab',
        isFocused: '=civicaseFocused',
        item: '=civicaseItem',
        formatCase: '=civicaseFormatter'
      }
    };
  });

})(angular, CRM.$, CRM._);
