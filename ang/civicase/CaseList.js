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
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.pageSize = 2;
    $scope.pageNum = 1;
    $scope.CRM = CRM;
    $scope.caseIsFocused = false;
    $scope.sortField = 'contact_id.sort_name';
    $scope.sortDir = 'ASC';
    $scope.filters = {};
    $scope.searchIsOpen = false;
    $scope.pageTitle = '';
    $scope.caseActions = CRM.civicase.caseActions;

    var caseTypes = CRM.civicase.caseTypes,
      caseStatuses = CRM.civicase.caseStatuses,
      activityTypes = $scope.activityTypes = CRM.civicase.activityTypes,
      tmpSelection = [];

    $scope.cases = [];

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
    
    function getSelected() {
      return _.filter($scope.cases, 'selected');
    }

    $scope.selectedCases = function() {
      return _.pluck(getSelected(), 'id');
    };

    $scope.isSelection = function(condition) {
      if (!$scope.cases) {
        return false;
      }
      var count = getSelected().length;
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
    
    // Perform bulk actions
    $scope.doAction = function(action) {
      $scope.$eval(action.action, {
        cases: getSelected(),
        deleteCases: function(cases, mode) {
          var msg, trash = 1;
          switch (mode) {
            case 'delete':
              trash = 0;
              msg = cases.length === 1 ? ts('Permanently delete selected case? This cannot be undone.') : ts('Permanently delete %1 cases? This cannot be undone.', {'1': cases.length});
              break;

            case 'restore':
              msg = cases.length === 1 ? ts('Undelete selected case?') : ts('Undelete %1 cases?', {'1': cases.length});
              break;

            default:
              msg = cases.length === 1 ? ts('This case and all associated activities will be moved to the trash.') : ts('%1 cases and all associated activities will be moved to the trash.', {'1': cases.length});
              mode = 'delete';
          }
          CRM.confirm({title: action.title, message: msg})
            .on('crmConfirm:yes', function() {
              var calls = [];
              _.each(cases, function(item) {
                calls.push(['Case', mode, {id: item.id, move_to_trash: trash}]);
              });
              crmApi(calls, true).then(getCases);
            });
        },
        mergeCases: function(cases) {
          var msg = ts('Merge all activitiy records into a single case?');
          if (cases[0].case_type_id !== cases[1].case_type_id) {
            msg += '<br />' + ts('Warning: selected cases are of different types.');
          }
          if (!angular.equals(cases[0].client, cases[1].client)) {
            msg += '<br />' + ts('Warning: selected cases belong to different clients.');
          }
          CRM.confirm({title: action.title, message: msg})
            .on('crmConfirm:yes', function() {
              crmApi('Case', 'merge', {case_id_1: cases[0].id, case_id_2: cases[1].id}, true).then(getCases);
            });
        },
        changeStatus: function(cases) {
          var types = _.uniq(_.map(cases, 'case_type_id')),
            msg = '<input name="change_case_status" placeholder="' + ts('Select New Status') + '" />',
            statuses = _.map(caseStatuses, function(item) {return {id: item.name, text: item.label};});
          _.each(types, function(caseTypeId) {
            var allowedStatuses = caseTypes[caseTypeId].definition.statuses || [];
            if (allowedStatuses.length) {
              _.remove(statuses, function(status) {
                return allowedStatuses.indexOf(status.id) < 0;
              });
            }
          });

          CRM.confirm({
            title: action.title,
            message: msg,
            open: function() {
              $('input[name=change_case_status]', this).crmSelect2({data: statuses});
            }
          })
            .on('crmConfirm:yes', function() {
              var ids = _.map(cases, 'id'),
                status = $('input[name=change_case_status]', this).val();
              crmApi('Case', 'get', {id: {IN: ids}, 'api.Case.create': {status_id: status}}, true).then(getCases);
            });
        },
        emailManagers: function(cases) {
          var managers = [];
          _.each(cases, function(item) {
            _.each(item.contacts, function(contact) {
              if (contact.manager) {
                managers.push(item.manager.contact_id);
              }
            });
          });
          var url = CRM.url('civicrm/activity/email/add', {
            action: 'add',
            reset: 1,
            atype: _.findKey(activityTypes, {name: 'Email'}),
            cid: _.uniq(managers).join(',')
          });
          CRM.loadForm(url);
        }
      });
    };

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
      // Special actions when viewing deleted cases
      if ($scope.filters.is_deleted) {
        $scope.caseActions = [
          {action: 'deleteCases(cases, "delete")', title: ts('Delete Permanently')},
          {action: 'deleteCases(cases, "restore")', title: ts('Restore from Trash')}
        ];
      }

      // If there are filters the $watchCollection on it will have triggered a load. Otherwise do it now.
      if (angular.equals($scope.filters, {})) {
        getCases();
      }
    });

  });

})(angular, CRM.$, CRM._);
