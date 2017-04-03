(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/list', {
      controller: 'CivicaseCaseList',
      templateUrl: '~/civicase/CaseList.html'
    });
  });

  // CaseList controller
  angular.module('civicase').controller('CivicaseCaseList', function($scope, crmApi, crmStatus, crmUiHelp, crmThrottle) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var ITEMS_PER_PAGE = 25,
      pageNum = 0;
    $scope.CRM = CRM;
    $scope.caseIsFocused = false;
    $scope.sortField = 'contact_id.sort_name';
    $scope.sortDir = 'ASC';
    $scope.filters = {};

    function mapSelectOptions(opt) {
      return {
        id: opt.value || opt.name,
        text: opt.label || opt.title,
        color: opt.color,
        icon: opt.icon
      };
    }

    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = CRM.civicase.caseStatuses;
    $scope.activityTypes = CRM.civicase.activityTypes;

    $scope.caseTypeOptions = _.map(caseTypes, mapSelectOptions);
    $scope.caseStatusOptions = _.map(caseStatuses, mapSelectOptions);

    $scope.cases = [];

    $scope.viewingCase = null;
    $scope.viewCase = function(id, $event) {
      if (!$($event.target).is('input, button')) {
        unfocusCase();
        if ($scope.viewingCase === id) {
          $scope.viewingCase = null;
        } else {
          $scope.viewingCase = id;
        }
      }
    };

    var unfocusCase = $scope.unfocusCase = function() {
      $scope.caseIsFocused = false;
    };

    $scope.nextPage = function() {
      ++pageNum;
      getCases(true);
    };

    $scope.selectAll = function(e) {
      var checked = e.target.checked;
      _.each($scope.cases, function(item) {
        item.selected = checked;
      });
    };

    $scope.isSelection = function(condition) {
      var count = _.filter($scope.cases, 'selected').length;
      if (condition === 'all') {
        return count === $scope.cases.length;
      } else if (condition === 'any') {
        return !!count;
      }
      return count === condition;
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
    }

    var getCases = $scope.getCases = function(nextPage) {
      if (nextPage !== true) {
        pageNum = 0;
      }
      crmThrottle(_loadCases).then(function(result) {
        var newCases = _.each(result.cases.values, formatCase);
        if (pageNum) {
          $scope.cases = $scope.cases.concat(newCases);
        } else {
          $scope.cases = newCases;
        }
        var remaining = result.count - (ITEMS_PER_PAGE * (pageNum + 1));
        $scope.totalCount = result.count;
        $scope.remaining = remaining > 0 ? remaining : 0;
        if (!result.count && !pageNum) {
          $scope.remaining = false;
        }
      });
    };

    function _loadCases() {
      var returnParams = {
        sequential: 1,
        return: ['subject', 'case_type_id', 'status_id', 'contacts', 'activity_summary'],
        options: {
          categories: {milestone: 1, task: 1, alert: 10},
          sort: $scope.sortField + ' ' + $scope.sortDir,
          limit: ITEMS_PER_PAGE,
          offset: ITEMS_PER_PAGE * pageNum
        }
      };
      // Keep things consistent and add a secondary sort on client name and a tertiary sort on case id
      if ($scope.sortField !== 'id' && $scope.sortField !== 'contact_id.sort_name') {
        returnParams.options.sort += ', contact_id.sort_name';
      }
      if ($scope.sortField !== 'id') {
        returnParams.options.sort += ', id';
      }
      var params = {
        is_deleted: 0
      };
      _.each($scope.filters, function(val, filter) {
        if (val && val.length) {
          params[filter] = {IN: val.split(',')};
        }
      });
      // If no status specified, default to all open cases
      if (!params.status_id) {
        params['status_id.grouping'] = 'Opened';
      }
      return crmApi({
        cases: ['Case', 'getdetails', $.extend(true, returnParams, params)],
        count: ['Case', 'getcount', params]
      });
    }

    $scope.$watch('sortField', getCases);
    $scope.$watch('sortDir', getCases);
    $scope.$watchCollection('filters', getCases);

  });

})(angular, CRM.$, CRM._);
