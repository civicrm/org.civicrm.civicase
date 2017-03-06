(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
      $routeProvider.when('/case/list', {
        controller: 'CivicaseCaseList',
        templateUrl: '~/civicase/CaseList.html',
        resolve: {
          data: function(crmApi) {
            return crmApi({
              statuses: ['Case', 'getoptions', {field: 'status_id'}],
              types: ['Case', 'getoptions', {field: 'case_type_id'}]
            })
          }
        }
      });
    }
  );

  // CaseList controller
  angular.module('civicase').controller('CivicaseCaseList', function($scope, crmApi, crmStatus, crmUiHelp, crmThrottle, data) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var ITEMS_PER_PAGE = 25,
      pageNum = 0;

    var caseTypes = $scope.caseTypes = data.types.values;
    var caseStatuses = $scope.caseStatuses = data.statuses.values;

    $scope.nextPage = function() {
      ++pageNum;
      getCases(true);
    };

    function formatCase(item) {
      item.myRole = [];
      item.status = caseStatuses[item.status_id];
      item.case_type = caseTypes[item.case_type_id];
      _.each(item.contacts, function(contact) {
        if (!item.client && contact.role === ts('Client')) {
          item.client = contact;
        }
        if (contact.contact_id == CRM.config.user_contact_id) {
          item.myRole.push(contact.role);
        }
      });
    }

    function getCases(nextPage) {
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
        $scope.remaining = remaining > 0 ? remaining : 0;
        if (!result.count && !pageNum) {
          $scope.remaining = false;
        }
      });
    }

    function _loadCases() {
      var returnParams = {
        sequential: 1,
        return: ['subject', 'case_type_id', 'status_id', 'contacts'],
        options: {
          limit: ITEMS_PER_PAGE,
          offset: ITEMS_PER_PAGE * pageNum
        }
      };
      var params = {
        is_deleted: 0
      };
      return crmApi({
        cases: ['Case', 'get', $.extend(true, returnParams, params)],
        count: ['Case', 'getcount', params]
      });
    }

    getCases();

  });

})(angular, CRM.$, CRM._);
