(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/:id', {
      template: '<div id="bootstrap-theme" class="civicase-main" civicase-view="caseId"></div>',
      controller: 'CivicaseCaseView'
    });
  });

  // CaseList route controller
  angular.module('civicase').controller('CivicaseCaseView', function($scope, $route) {
    $scope.caseId = $route.current.params.id;
  });

  // CaseList directive controller
  function caseListController($scope, crmApi, isActivityOverdue, formatActivity) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = $scope.caseStatuses = CRM.civicase.caseStatuses;
    var activityTypes = $scope.activityTypes = CRM.civicase.activityTypes;
    $scope.isActivityOverdue = isActivityOverdue;
    $scope.CRM = CRM;
    $scope.item = null;

    function caseGetParams() {
      return {
        id: $scope.caseId,
        return: ['subject', 'contact_id', 'case_type_id', 'case_type_id.definition', 'status_id', 'contacts', 'start_date', 'end_date', 'activity_summary', 'activity_count', 'tag_id.name', 'tag_id.color', 'tag_id.description'],
        // For the "related cases" section
        'api.Case.get': {
          contact_id: {IN: "$value.contact_id"},
          id: {"!=": "$value.id"},
          is_deleted: 0,
          return: ['case_type_id', 'start_date', 'end_date', 'contact_id', 'status_id']
        },
        // For the "recent communication" section
        'api.Activity.get': {
          case_id: "$value.id",
          "activity_type_id.grouping": "communication",
          activity_date_time: {'<=': 'now'},
          options: {limit: 5},
          return: ['activity_type_id', 'subject', 'activity_date_time', 'status_id', 'target_contact_name', 'assignee_contact_name']
        },
        sequential: 1,
        options: {
          categories: {communication: 1, task: 5, alert: 10, milestone: 1}
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

    function formatCase(item) {
      item.myRole = [];
      item.client = [];
      item.status = caseStatuses[item.status_id].label;
      item.case_type = caseTypes[item.case_type_id].title;
      item.selected = false;
      _.each(item.contacts, function(contact) {
        if (!contact.relationship_type_id) {
          item.client.push(contact);
        }
        if (contact.contact_id == CRM.config.user_contact_id) {
          item.myRole.push(contact.role);
        }
        if (contact.manager) {
          item.manager = contact;
        }
      });
      // Format related cases
      item.relatedCases = _.cloneDeep(item['api.Case.get'].values);
      delete(item['api.Case.get']);
      _.each(item.relatedCases, function(relCase) {
        relCase.contact_id = _.toArray(relCase.contact_id);
        delete(relCase.client_id);
        relCase.case_type = caseTypes[relCase.case_type_id].title;
        relCase.status = caseStatuses[relCase.status_id].label;
        relCase.commonClients = [];
        _.each(item.client, function(client) {
          if (relCase.contact_id.indexOf(client.contact_id) >= 0) {
            relCase.commonClients.push(client.display_name);
          }
        });
      });
      // Format activities
      _.each(item.activity_summary, function(acts) {
        _.each(acts, formatActivity);
      });
      // Recent communications
      item.recentCommunication = _.each(_.cloneDeep(item['api.Activity.get'].values), formatActivity);
      delete(item['api.Activity.get']);
      return item;
    }

    $scope.markCompleted = function(act) {
      crmApi('Activity', 'create', {id: act.id, status_id: act.is_completed ? 'Scheduled' : 'Completed'}, {});
      $scope.item.activity_summary.task.splice(_.findIndex($scope.item.activity_summary.task, {id: act.id}), 1);
    };

    $scope.changeCaseStatus = function(statusId) {
      // Todo: business logic for this is currently stuck in the form layer.
      // @see CRM_Case_Form_Activity_ChangeCaseStatus
    };

    $scope.$watch('caseId', function() {
      if ($scope.caseId) {
        $scope.item = null;
        crmApi('Case', 'getdetails', caseGetParams()).then(function (info) {
          $scope.activeTab = 'summary';
          var item = $scope.item = formatCase(info.values[0]);
          $scope.allowedCaseStatuses = getAllowedCaseStatuses(item['case_type_id.definition']);
            $scope.availableActivityTypes = getAvailableActivityTypes(item.activity_count, item['case_type_id.definition']);
        });
      }
    });
  }

  angular.module('civicase').directive('civicaseView', function() {
    return {
      restrict: 'A',
      template:
        '<div class="panel panel-default civicase-view-panel">' +
          '<div class="panel-header" ng-if="item" ng-include="\'~/civicase/CaseHeader.html\'"></div>' +
          '<div class="panel-body" ng-if="item" ng-include="\'~/civicase/CaseTabs.html\'"></div>' +
        '</div>',
      controller: caseListController,
      scope: {
        caseId: '=civicaseView',
        isFocused: '=civicaseFocused'
      }
    };
  });

})(angular, CRM.$, CRM._);
