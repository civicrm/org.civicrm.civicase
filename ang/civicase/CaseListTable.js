(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseListTable', function () {
    return {
      controller: 'CivicaseCaseListTableController',
      templateUrl: '~/civicase/CaseListTable.html'
    };
  });

  module.controller('CivicaseCaseListTableController', function ($scope, crmApi, crmStatus, crmUiHelp, crmThrottle, $timeout, formatCase, ContactsDataService) {
    var firstLoad = true;
    var caseTypes = CRM.civicase.caseTypes;

    $scope.activityCategories = CRM.civicase.activityCategories;
    $scope.activityTypes = CRM.civicase.activityTypes;
    $scope.cases = [];
    $scope.caseStatuses = CRM.civicase.caseStatuses;
    $scope.CRM = CRM;
    $scope.isLoading = true;
    $scope.page = {total: 0};
    $scope.pageTitle = '';
    $scope.selectedCases = [];
    $scope.sort = {sortable: true};
    $scope.ts = CRM.ts('civicase');
    $scope.viewingCaseDetails = null;

    (function init () {
      initiateBulkActions();
      bindRouteParamsToScope();
      initiateWatchers();

      $scope.casePlaceholders = $scope.filters.id ? [0] : _.range($scope.page.size);
      getCases();
    }());

    $scope.applyAdvSearch = function (newFilters) {
      $scope.filters = newFilters;
      getCases();
    };

    /**
     * Change Sort Direction
     */
    $scope.changeSortDir = function () {
      $scope.sort.dir = ($scope.sort.dir === 'ASC' ? 'DESC' : 'ASC');
    };

    $scope.isSelection = function (condition) {
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

    /**
     * Refresh the Case List View
     *
     * @param {array} apiCalls
     */
    $scope.refresh = function (apiCalls) {
      $scope.isLoading = true;

      apiCalls = apiCalls || [];
      apiCalls = apiCalls.concat(getCaseApiParams(angular.extend({}, $scope.filters, $scope.hiddenFilters), $scope.sort, $scope.page));

      crmApi(apiCalls, true)
        .then(function (result) {
          $scope.cases = _.each(result[apiCalls.length - 2].values, formatCase);
          $scope.totalCount = result[apiCalls.length - 1];
          $scope.isLoading = false;
        });
    };

    $scope.selectAll = function (e) {
      var checked = e.target.checked;

      _.each($scope.cases, function (item) {
        item.selected = checked;
      });
    };

    $scope.unfocusCase = function () {
      $scope.caseIsFocused = false;
    };

    $scope.viewCase = function (id, $event) {
      if (!$scope.bulkAllowed) {
        return;
      }

      if (!$event || !$($event.target).is('a, a *, input, button')) {
        $scope.unfocusCase();
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

    /**
     * Binds all route parameters to scope
     */
    function bindRouteParamsToScope () {
      $scope.$bindToRoute({expr: 'searchIsOpen', param: 'sx', format: 'bool', default: false});
      $scope.$bindToRoute({expr: 'sort.field', param: 'sf', format: 'raw', default: 'contact_id.sort_name'});
      $scope.$bindToRoute({expr: 'sort.dir', param: 'sd', format: 'raw', default: 'ASC'});
      $scope.$bindToRoute({expr: 'caseIsFocused', param: 'focus', format: 'bool', default: false});
      $scope.$bindToRoute({expr: 'filters', param: 'cf', default: {}});
      $scope.$bindToRoute({expr: 'viewingCase', param: 'caseId', format: 'raw'});
      $scope.$bindToRoute({expr: 'viewingCaseTab', param: 'tab', format: 'raw', default: 'summary'});
      $scope.$bindToRoute({expr: 'page.size', param: 'cps', format: 'int', default: 15});
      $scope.$bindToRoute({expr: 'page.num', param: 'cpn', format: 'int', default: 1});
    }

    function caseIsFocusedWatchHandler () {
      $timeout(function () {
        var $actHeader = $('.act-feed-panel .panel-header');
        var $actControls = $('.act-feed-panel .act-list-controls');

        if ($actHeader.hasClass('affix')) {
          $actHeader.css('width', $('.act-feed-panel').css('width'));
        } else {
          $actHeader.css('width', 'auto');
        }

        if ($actControls.hasClass('affix')) {
          $actControls.css('width', $actHeader.css('width'));
        } else {
          $actControls.css('width', 'auto');
        }
      }, 1500);
    }

    /**
     * Fetch Contacts Profile Pic and Type
     *
     * @param {array} cases
     */
    function fetchContactsData (cases) {
      var contacts = [];

      _.each(cases, function (data) {
        if (data.next_activity) {
          contacts = contacts.concat(data.next_activity.assignee_contact_id);
          contacts = contacts.concat(data.next_activity.target_contact_id);
        }
      });

      ContactsDataService.add(contacts);
    }
    /**
     * Get all cases
     */
    function getCases () {
      $scope.isLoading = true;
      setPageTitle();
      crmThrottle(makeApiCallToLoadCases)
        .then(function (result) {
          var cases = _.each(result[0].values, formatCase);

          fetchContactsData(cases);

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

          if (typeof result[2] !== 'undefined') {
            $scope.headers = result[2].values;
          }

          $scope.cases = cases;
          $scope.page.num = result[0].page || $scope.page.num;
          $scope.totalCount = result[1];
          $scope.page.total = Math.ceil(result[1] / $scope.page.size);
          setPageTitle();
          firstLoad = $scope.isLoading = false;
        });
    }

    function initiateWatchers () {
      $scope.$watchCollection('sort', updateCases);
      $scope.$watchCollection('page', updateCases);
      $scope.$watch('caseIsFocused', caseIsFocusedWatchHandler);
      $scope.$watch('cases', function (cases) {
        $scope.selectedCases = _.filter(cases, 'selected');
      }, true);
    }

    /**
     * Initialise the Bulk Actions Functionality
     */
    function initiateBulkActions () {
      if (CRM.checkPerm('basic case information') &&
      !CRM.checkPerm('administer CiviCase') &&
      !CRM.checkPerm('access my cases and activities') &&
      !CRM.checkPerm('access all cases and activities')
      ) {
        $scope.bulkAllowed = false;
      } else {
        $scope.bulkAllowed = true;
      }
    }

    /**
     * Get patameneters to load cases
     *
     * @param {object} filters
     * @param {object} sort
     * @param {object} page
     *
     * @return {array}
     */
    function getCaseApiParams (filters, sort, page) {
      var returnParams = {
        sequential: 1,
        return: ['subject', 'case_type_id', 'status_id', 'is_deleted', 'start_date', 'modified_date', 'contacts', 'activity_summary', 'category_count', 'tag_id.name', 'tag_id.color', 'tag_id.description'],
        options: {
          sort: sort.field + ' ' + sort.dir,
          limit: page.size,
          offset: page.size * (page.num - 1)
        },
        'api.Activity.get': {}
      };
      // Keep things consistent and add a secondary sort on client name and a tertiary sort on case id
      if (sort.field !== 'id' && sort.field !== 'contact_id.sort_name') {
        returnParams.options.sort += ', contact_id.sort_name';
      }
      if (sort.field !== 'id') {
        returnParams.options.sort += ', id';
      }
      var params = {'case_type_id.is_active': 1};
      _.each(filters, function (val, filter) {
        if (val || typeof val === 'boolean') {
          if (typeof val === 'number' || typeof val === 'boolean') {
            params[filter] = val;
          } else if (typeof val === 'object' && !$.isArray(val)) {
            params[filter] = val;
          } else if (val.length) {
            params[filter] = $.isArray(val) ? {IN: val} : {LIKE: '%' + val + '%'};
          }
        }
      });
      // Filter out deleted contacts
      if (!params.contact_id) {
        params.contact_is_deleted = 0;
      }
      // If no status specified, default to all open cases
      if (!params.status_id && !params.id) {
        params['status_id.grouping'] = 'Opened';
      }
      // Default to not deleted
      if (!params.is_deleted && !params.id) {
        params.is_deleted = 0;
      }
      return [
        ['Case', 'getcaselist', $.extend(true, returnParams, params)],
        ['Case', 'getcount', params]
      ];
    }

    /**
     * Make Api call to load cases
     *
     * @return {promise}
     */
    function makeApiCallToLoadCases () {
      var params = getCaseApiParams(angular.extend({}, $scope.filters, $scope.hiddenFilters), $scope.sort, $scope.page);
      if (firstLoad && $scope.viewingCase) {
        params[0][2].options.page_of_record = $scope.viewingCase;
      } else if (firstLoad) {
        params.push(['Case', 'getcaselistheaders']);
      }

      return crmApi(params);
    }

    /**
     * Set the title of the page
     */
    function setPageTitle () {
      var viewingCase = $scope.viewingCase;
      var cases = $scope.cases;
      var filters = $scope.filters;
      // Hide page title when case is selected
      $('h1.crm-page-title').toggle(!viewingCase);
      if (viewingCase) {
        var item = _.findWhere(cases, {id: viewingCase});
        if (item) {
          $scope.pageTitle = item.client[0].display_name + ' - ' + item.case_type;
        }
        return;
      }
      if (_.size(_.omit(filters, ['status_id', 'case_type_id']))) {
        $scope.pageTitle = $scope.ts('Case Search Results');
      } else {
        var status = [];
        if (filters.status_id && filters.status_id.length) {
          _.each(filters.status_id, function (s) {
            status.push(_.findWhere($scope.caseStatuses, {name: s}).label);
          });
        } else {
          status = [$scope.ts('All Open')];
        }
        var type = [];
        if (filters.case_type_id && filters.case_type_id.length) {
          _.each(filters.case_type_id, function (t) {
            type.push(_.findWhere(caseTypes, {name: t}).title);
          });
        }
        $scope.pageTitle = status.join(' & ') + ' ' + type.join(' & ') + ' ' + $scope.ts('Cases');
      }
      if (typeof $scope.totalCount === 'number') {
        $scope.pageTitle += ' (' + $scope.totalCount + ')';
      }
    }

    /**
     * Update Cases when watch parameters has changed
     *
     * @param {object} newValue
     * @param {object} oldValue
     */
    function updateCases (newValue, oldValue) {
      if (newValue !== oldValue) {
        getCases();
      }
    }
  });
})(angular, CRM.$, CRM._);
