(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/search', {
      template: '<h1 crm-page-title>{{ ts(\'Find Cases\') }}</h1><div id="bootstrap-theme" class="civicase-main"><div class="panel" civicase-search="{}" expanded="true"></div></div>',
      controller: searchPageController
    });
  });

  function searchPageController($scope) {
    var ts = $scope.ts = CRM.ts('civicase');
  }

  // Case search directive controller
  function searchController($scope, $location, $timeout) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');

    function mapSelectOptions(opt) {
      return {
        id: opt.value || opt.name,
        text: opt.label || opt.title,
        color: opt.color,
        icon: opt.icon
      };
    }

    var caseTypes = CRM.civicase.caseTypes,
      caseStatuses = CRM.civicase.caseStatuses;

    $scope.caseTypeOptions = _.map(caseTypes, mapSelectOptions);
    $scope.caseStatusOptions = _.map(caseStatuses, mapSelectOptions);
    $scope.customGroups = CRM.civicase.customSearchFields;
    $scope._ = _;
    $scope.checkPerm = CRM.checkPerm;

    $scope.showMore = function() {
      $scope.expanded = true;
    };

    $scope.setCaseManager = function() {
      $scope.filters.case_manager = $scope.caseManagerIsMe() ? null : [CRM.config.user_contact_id];
    };

    $scope.caseManagerIsMe = function() {
      return $scope.filters.case_manager && $scope.filters.case_manager.length === 1 && $scope.filters.case_manager[0] === CRM.config.user_contact_id;
    };

    $scope.doSearch = function() {
      var search = {};
      _.each($scope.filters, function(val, key) {
        if (!_.isEmpty(val) || (typeof val === 'number' && val) || typeof val === 'boolean' && val) {
          search[key] = val;
        }
      });
      window.location.hash = 'case/list?search=' + encodeURIComponent(JSON.stringify(search));
    };

    $scope.clearSearch = function() {
      window.location.hash = 'case/list';
    };

    var args = $location.search();
    if (args && args.search) {
      $scope.filters = JSON.parse(args.search);
    }

    // Describe selected filters when collapsed
    var allSearchFields = {
      id: {
        label: ts('Case ID'),
        html_type: 'Number'
      },
      contact_id: {
        label: ts('Case Client')
      },
      case_manager: {
        label: ts('Case Manager')
      },
      start_date: {
        label: ts('Start Date')
      },
      end_date: {
        label: ts('End Date')
      },
      is_deleted: {
        label: ts('Deleted Cases')
      }
    };
    _.each(CRM.civicase.customSearchFields, function(group) {
      _.each(group.fields, function(field) {
        allSearchFields['custom_' + field.id] = field;
      });
    });
    var des = $scope.filterDescription = [];
    _.each($scope.filters, function(val, key) {
      var field = allSearchFields[key];
      if (field) {
        var d = {label: field.label};
        if (field.options) {
          var text = [];
          _.each(val, function(o) {
            text.push(_.findWhere(field.options, {key: o}).value);
          });
          d.text = text.join(', ');
        } else if (key === 'case_manager' && $scope.caseManagerIsMe()) {
          d.text = ts('Me');
        } else if ($.isArray(val)) {
          d.text = ts('%1 selected', {'1': val.length});
        } else if ($.isPlainObject(val)) {
          if (val.BETWEEN) {
            d.text = val.BETWEEN[0] + ' - ' + val.BETWEEN[1];
          } else if (val['<=']) {
            d.text = '≤ ' + val['<='];
          } else if (val['>=']) {
            d.text = '≥ ' + val['>='];
          } else {
            var k = _.findKey(val, function() {return true;});
            d.text = k + ' ' + val[k];
          }
        } else if (typeof val === 'boolean') {
          d.text = val ? ts('Yes') : ts('No');
        } else {
          d.text = val;
        }
        des.push(d);
      }
    });
  }

  angular.module('civicase').directive('civicaseSearch', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/Search.html',
      controller: searchController,
      scope: {
        filters: '=civicaseSearch',
        expanded: '='
      }
    };
  });

})(angular, CRM.$, CRM._);
