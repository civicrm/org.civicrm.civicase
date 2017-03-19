(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/:id', {
      template: '<div id="bootstrap-theme" civicase-view="caseId"></div>',
      controller: 'CivicaseCaseView'
    });
  });

  // CaseList route controller
  angular.module('civicase').controller('CivicaseCaseView', function($scope, $route) {
    $scope.caseId = $route.current.params.id;
  });

  // CaseList directive controller
  function caseListController($scope, crmApi, isActivityOverdue) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = $scope.caseStatuses = CRM.civicase.caseStatuses;
    $scope.activityTypes = CRM.civicase.activityTypes;
    $scope.isActivityOverdue = isActivityOverdue;
    $scope.CRM = CRM;
    $scope.item = null;

    function caseGetParams() {
      return {
        id: $scope.caseId,
        return: ['subject', 'case_type_id', 'status_id', 'contacts', 'start_date', 'end_date', 'activity_summary', 'tag_id.name', 'tag_id.color', 'tag_id.description'],
        sequential: 1
      };
    }

    $scope.tabs = [
      {name: 'summary', label: ts('Summary')},
      {name: 'activities', label: ts('Activities')},
      {name: 'people', label: ts('People')},
      {name: 'files', label: ts('Files')}
    ];

    $scope.selectTab = function(tab) {
      $scope.activeTab = tab;
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
      return item;
    }

    $scope.changeCaseStatus = function(statusId) {
      // Todo: business logic for this is currently stuck in the form layer.
      // @see CRM_Case_Form_Activity_ChangeCaseStatus
    };

    $scope.$watch('caseId', function() {
      $scope.item = null;
      crmApi('Case', 'getdetails', caseGetParams()).then(function(info) {
        $scope.activeTab = 'summary';
        $scope.item = formatCase(info.values[0]);
      });
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
        caseId: '=civicaseView'
      }
    };
  });

})(angular, CRM.$, CRM._);
