(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/list', {
      controller: 'CivicaseCaseList',
      templateUrl: '~/civicase/CaseList.html'
    });
  });

  // CaseList controller
  angular.module('civicase').controller('CivicaseCaseList', function($scope, crmApi, crmStatus, crmUiHelp, crmThrottle, $timeout) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase'),
      caseTypes = CRM.civicase.caseTypes,
      caseStatuses = CRM.civicase.caseStatuses,
      tmpSelection = [];
    $scope.activityTypes = CRM.civicase.activityTypes;
    $scope.cases = [];
    $scope.pageSize = 25;
    $scope.pageNum = 1;
    $scope.CRM = CRM;
    $scope.caseIsFocused = false;
    $scope.sortField = 'contact_id.sort_name';
    $scope.sortDir = 'ASC';
    $scope.filters = {};
    $scope.searchIsOpen = false;
    $scope.pageTitle = '';
    $scope.viewingCase = null;

    $scope.viewCase = function(id, $event) {
      if (!$event || !$($event.target).is('input, button')) {
        unfocusCase();
        if ($scope.viewingCase === id) {
          $scope.viewingCase = null;
        } else {
          $scope.viewingCase = id;
        }
      }
      setPageTitle();
    };

    var unfocusCase = $scope.unfocusCase = function() {
      $scope.caseIsFocused = false;
    };

    $scope.selectAll = function(e) {
      var checked = e.target.checked;
      _.each($scope.cases, function(item) {
        item.selected = checked;
      });
    };
    
    var getSelectedCases = $scope.getSelectedCases = function() {
      return _.filter($scope.cases, 'selected');
    };

    $scope.isSelection = function(condition) {
      if (!$scope.cases) {
        return false;
      }
      var count = getSelectedCases().length;
      if (condition === 'all') {
        return count === $scope.cases.length;
      } else if (condition === 'any') {
        return !!count;
      }
      return count === condition;
    };

    function setPageTitle() {
      var viewingCase = $scope.viewingCase,
        cases = $scope.cases,
        filters = $scope.filters;
      if (viewingCase) {
        var item = _.findWhere(cases, {id: viewingCase});
        if (item) {
          $scope.pageTitle = item.client[0].display_name + ' - ' + item.case_type;
        }
        return;
      }
      if (_.size(_.omit(filters, ['status_id', 'case_type_id']))) {
        $scope.pageTitle = ts('Case Search Results');
      } else {
        var status = [];
        if (filters.status_id && filters.status_id.length) {
          _.each(filters.status_id, function(s) {
            status.push(_.findWhere(caseStatuses, {name: s}).label);
          });
        } else {
          status = [ts('All Open')];
        }
        var type = [];
        if (filters.case_type_id && filters.case_type_id.length) {
          _.each(filters.case_type_id, function(t) {
            type.push(_.findWhere(caseTypes, {name: t}).title);
          });
        }
        $scope.pageTitle = status.join(' & ') + ' ' + type.join(' & ') + ' ' + ts('Cases');
      }
      if (typeof $scope.totalCount === 'number') {
        $scope.pageTitle += ' (' + $scope.totalCount + ')';
      }
    }

    function formatCase(item) {
      item.myRole = [];
      item.client = [];
      item.status = caseStatuses[item.status_id].label;
      item.case_type = caseTypes[item.case_type_id].title;
      item.selected = tmpSelection.indexOf(item.id) >= 0;
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

    var getCases = $scope.getCases = function() {
      setPageTitle();
      crmThrottle(_loadCases).then(function(result) {
        $scope.cases = _.each(result.cases.values, formatCase);
        $scope.totalCount = result.count;
        setPageTitle();
      });
    };

    function _loadCases() {
      var returnParams = {
        sequential: 1,
        return: ['subject', 'case_type_id', 'status_id', 'contacts', 'activity_summary', 'unread_email_count'],
        options: {
          categories: {milestone: 1, task: 1, alert: 10},
          sort: $scope.sortField + ' ' + $scope.sortDir,
          limit: $scope.pageSize,
          offset: $scope.pageSize * ($scope.pageNum - 1)
        }
      };
      // Keep things consistent and add a secondary sort on client name and a tertiary sort on case id
      if ($scope.sortField !== 'id' && $scope.sortField !== 'contact_id.sort_name') {
        returnParams.options.sort += ', contact_id.sort_name';
      }
      if ($scope.sortField !== 'id') {
        returnParams.options.sort += ', id';
      }
      var params = {};
      _.each($scope.filters, function(val, filter) {
        if (val || typeof val === 'boolean') {
          if (typeof val === 'number' || typeof val === 'boolean') {
            params[filter] = val;
          }
          else if (typeof val === 'object' && !$.isArray(val)) {
            params[filter] = val;
          }
          else if (val.length) {
            params[filter] = $.isArray(val) ? {IN: val} : {LIKE: '%' + val + '%'};
          }
        }
      });
      // If no status specified, default to all open cases
      if (!params.status_id && !params.id) {
        params['status_id.grouping'] = 'Opened';
      }
      // Default to not deleted
      if (!params.is_deleted && !params.id) {
        params.is_deleted = 0;
      }
      return crmApi({
        cases: ['Case', 'getdetails', $.extend(true, returnParams, params)],
        count: ['Case', 'getcount', params]
      });
    }

    function getCasesFromWatcher(newValue, oldValue) {
      if (newValue !== oldValue) {
        getCases();
      }
    }

    $scope.$watch('sortField', getCasesFromWatcher);
    $scope.$watch('sortDir', getCasesFromWatcher);
    $scope.$watch('pageNum', getCasesFromWatcher);
    $scope.$watchCollection('filters', function(newValue, oldValue) {
      // Only live-update filter results if search is collapsed
      if (!$scope.searchIsOpen && !angular.equals(newValue, oldValue)) {
        $scope.totalCount = null;
        getCases();
      }
    });

    $timeout(function() {
      // If there are filters the $watchCollection on it will have triggered a load. Otherwise do it now.
      if (angular.equals($scope.filters, {})) {
        getCases();
      }
    });

  });

})(angular, CRM.$, CRM._);
