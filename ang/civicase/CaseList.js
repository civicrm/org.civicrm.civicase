(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/list', {
      reloadOnSearch: false,
      resolve: {
        hiddenFilters: function() {}
      },
      controller: 'CivicaseCaseList',
      templateUrl: '~/civicase/CaseList.html'
    });
  });

  // CaseList controller
  angular.module('civicase').controller('CivicaseCaseList', function($scope, crmApi, crmStatus, crmUiHelp, crmThrottle, $timeout, hiddenFilters, getActivityFeedUrl, formatActivity) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase'),
      caseTypes = CRM.civicase.caseTypes,
      tmpSelection = [];
    $scope.caseStatuses = caseStatuses = CRM.civicase.caseStatuses;
    $scope.activityTypes = CRM.civicase.activityTypes;
    $scope.activityCategories = CRM.civicase.activityCategories;
    $scope.cases = [];
    $scope.CRM = CRM;
    $scope.pageTitle = '';
    $scope.viewingCaseDetails = null;
    $scope.selectedCases = [];
    $scope.activityFeedUrl = getActivityFeedUrl;
    $scope.hiddenFilters = hiddenFilters;
    $scope.pages = 0;

    $scope.$bindToRoute({expr:'searchIsOpen', param: 'sx', format: 'bool', default: false});
    $scope.$bindToRoute({expr:'sortField', param:'sf', format: 'raw', default: 'contact_id.sort_name'});
    $scope.$bindToRoute({expr:'sortDir', param:'sd', format: 'raw', default: 'ASC'});
    $scope.$bindToRoute({expr:'caseIsFocused', param:'focus', format: 'bool', default: false});
    $scope.$bindToRoute({expr:'filters', param:'cf', default: {}});
    $scope.$bindToRoute({expr:'viewingCase', param:'caseId', format: 'raw'});
    $scope.$bindToRoute({expr:'viewingCaseTab', param:'tab', format: 'raw', default:'summary'});
    $scope.$bindToRoute({expr:'pageSize', param:'cps', format: 'int', default: 15});
    $scope.$bindToRoute({expr:'pageNum', param:'cpn', format: 'int', default: 1});

    $scope.viewCase = function(id, $event) {
      if (!$event || !$($event.target).is('a, a *, input, button')) {
        unfocusCase();
        if ($scope.viewingCase === id) {
          $scope.viewingCase = null;
          $scope.viewingCaseDetails = null;
        } else {
          $scope.viewingCaseDetails = _.findWhere($scope.cases, {id: id});
          $scope.viewingCase = id;
          $scope.viewingCaseTab = 'summary';
        }
      }
      setPageTitle();
    };

    
    $scope.$watch('caseIsFocused', function() {
      $timeout(function() {
        var $actHeader = $('.act-feed-panel .panel-header'),
        $actControls = $('.act-feed-panel .act-list-controls');

        if($actHeader.hasClass('affix')) {
            $actHeader.css('width',$('.act-feed-panel').css('width'));
        }
        else {
          $actHeader.css('width', 'auto');
        }

        if($actControls.hasClass('affix')) {
            $actControls.css('width',$actHeader.css('width'));
        }
        else {
          $actControls.css('width', 'auto');
        }
      },1500);
    });

    var unfocusCase = $scope.unfocusCase = function() {
      $scope.caseIsFocused = false;
    };

    $scope.selectAll = function(e) {
      var checked = e.target.checked;
      _.each($scope.cases, function(item) {
        item.selected = checked;
      });
    };

    $scope.isSelection = function(condition) {
      if (!$scope.cases) {
        return false;
      }
      var count = $scope.selectedCases.length;
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

    var formatCase = $scope.formatCase = function(item) {
      item.myRole = [];
      item.client = [];
      item.status = caseStatuses[item.status_id].label;
      item.case_type = caseTypes[item.case_type_id].title;
      item.selected = tmpSelection.indexOf(item.id) >= 0;
      item.is_deleted = item.is_deleted === '1';
      _.each(item.activity_summary, function(activities) {
        _.each(activities, function(act) {
          formatActivity(act, item.id);
        });
      });
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
    };

    var getCases = $scope.getCases = function() {
      setPageTitle();
      crmThrottle(_loadCases).then(function(result) {
        var viewingCaseDetails;
        var cases = _.each(result[0].values, formatCase);
        if ($scope.viewingCase) {
          if ($scope.viewingCaseDetails) {
            var currentCase = _.findWhere(cases, {id: $scope.viewingCase});
            if (currentCase) {
              _.assign(currentCase, $scope.viewingCaseDetails);
            }
          } else {
            $scope.viewingCaseDetails = _.findWhere(cases, {id: $scope.viewingCase});
          }
        }
        $scope.cases = cases;
        $scope.totalCount = result[1];
        $scope.pages = Math.ceil(result[1] / $scope.pageSize);
        setPageTitle();
      });
    };

    $scope.refresh = function(apiCalls) {
      if (!apiCalls) apiCalls = [];
      apiCalls = apiCalls.concat(_loadCaseApiParams());
      crmApi(apiCalls, true).then(function(result) {
        $scope.cases = _.each(result[apiCalls.length - 2].values, formatCase);
        $scope.totalCount = result[apiCalls.length - 1];
      });
    };

    function _loadCaseApiParams() {
      var returnParams = {
        sequential: 1,
        return: ['subject', 'case_type_id', 'status_id', 'is_deleted', 'contacts', 'activity_summary', 'category_count'],
        options: {
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
      var params = {"case_type_id.is_active": 1};
      var filters = angular.extend({}, $scope.filters, $scope.hiddenFilters);
      _.each(filters, function(val, filter) {
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
      return [
        ['Case', 'getdetails', $.extend(true, returnParams, params)],
        ['Case', 'getcount', params]
      ];
    }

    function _loadCases() {
      return crmApi(_loadCaseApiParams());
    }

    function getCasesFromWatcher(newValue, oldValue) {
      if (newValue !== oldValue) {
        getCases();
      }
    }

    $scope.$watch('sortField', getCasesFromWatcher);
    $scope.$watch('sortDir', getCasesFromWatcher);
    $scope.$watch('pageNum', getCasesFromWatcher);
    $scope.$watch('cases', function(cases) {
      $scope.selectedCases = _.filter(cases, 'selected');
    }, true);
    // Hide page title when case is selected
    $scope.$watch('viewingCase', function(caseId) {
      $('h1.crm-page-title').toggle(!caseId);
    });

    $scope.applyAdvSearch = function(newFilters) {
      $scope.filters = newFilters;
      getCases();
    };

    $timeout(getCases);

  });

})(angular, CRM.$, CRM._);
