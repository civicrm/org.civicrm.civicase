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
    $scope.searchIsOpen = false;
    $scope.pageTitle = '';

    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = CRM.civicase.caseStatuses;
    $scope.activityTypes = CRM.civicase.activityTypes;

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
      setPageTitle();
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
          _.each(filters.status_id.split(','), function(s) {
            status.push(_.findWhere(caseStatuses, {name: s}).label);
          });
        } else {
          status = [ts('All Open')];
        }
        var type = [];
        if (filters.case_type_id && filters.case_type_id.length) {
          _.each(filters.case_type_id.split(','), function(t) {
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
      setPageTitle();
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
        setPageTitle();
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
        if (val || typeof val === 'boolean') {
          if (typeof val === 'number' || typeof val === 'boolean') {
            params[filter] = val;
          }
          else if (typeof val === 'object' && !$.isArray(val)) {
            params[filter] = val;
          }
          else if ($.isArray(val) && val.length) {
            params[filter] = {IN: val};
          }
          else {
            params[filter] = {LIKE: '%' + val + '%'};
          }
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
    $scope.$watchCollection('filters', function() {
      // Only live-update filter results if search is collapsed
      if (!$scope.searchIsOpen) {
        $scope.totalCount = null;
        getCases();
      }
    });

  });

})(angular, CRM.$, CRM._);
