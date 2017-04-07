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

    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = CRM.civicase.caseStatuses;

    $scope.caseTypeOptions = _.map(caseTypes, mapSelectOptions);
    $scope.caseStatusOptions = _.map(caseStatuses, mapSelectOptions);

    $scope.showMore = function() {
      $scope.expanded = true;
    };

    $scope.doSearch = function() {
      var search = {};
      _.each($scope.filters, function(val, key) {
        if (!_.isEmpty(val) || (typeof val === 'number' && val)) {
          search[key] = val;
        }
      });
      window.location.hash = 'case/list?search=' + encodeURIComponent(JSON.stringify(search));
    };

    var args = $location.search();
    if (args && args.search) {
      $scope.filters = JSON.parse(args.search);
    }

  }

  angular.module('civicase').directive('civicaseSearch', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/CaseSearch.html',
      controller: searchController,
      scope: {
        filters: '=civicaseSearch',
        expanded: '='
      }
    };
  });

})(angular, CRM.$, CRM._);
