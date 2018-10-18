(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseList', function () {
    return {
      restrict: 'EA',
      replace: true,
      controller: CivicaseContactCaseListController,
      templateUrl: '~/civicase/ContactCaseList.html',
      scope: {
        'caseType': '=',
        'pagerSize': '='
      }
    };
  });

  function CivicaseContactCaseListController ($scope, $rootScope, crmApi, formatCase, DateHelper) {
    var caseReturnParams = [
      'subject', 'details', 'contact_id', 'case_type_id', 'status_id',
      'contacts', 'start_date', 'end_date', 'is_deleted', 'activity_summary',
      'activity_count', 'category_count', 'tag_id.name', 'tag_id.color',
      'tag_id.description', 'tag_id.parent_id', 'related_case_ids'
    ];
    var defaultPageSize = 2;

    $scope.formatDate = DateHelper.formatDate;
    $scope.userId = getSelectedUserId();
    $scope.loadMore = loadCases;

    (function init () {
      resetGlobals();
      loadCases();
      initSubscribers();
    }());

    /**
     * Get parameters to load cases
     *
     * @param {object} filters
     * @param {object} sort
     * @param {object} page
     *
     * @return {array}
     */
    function getCaseApiParams (page) {
      var returnCaseParams = {
        sequential: 1,
        return: caseReturnParams,
        options: {
          sort: 'modified_date ASC',
          limit: page.size,
          offset: page.size * (page.num - 1)
        }
      };
      var params = {'case_type_id.is_active': 1};

      if ($scope.caseType !== 'Related') {
        params['contact_id'] = $scope.userId;
        params['status_id.grouping'] = $scope.caseType;
      } else {
        params['case_manager'] = $scope.userId;
      }

      return {
        cases: ['Case', 'getcaselist', $.extend(true, returnCaseParams, params)],
        count: ['Case', 'getcount', $.extend(true, returnCaseParams, params)]
      };
    }

    /**
     * Returns contact role
     *
     * @params {Object} cases
     * @return {String} role
     */
    function getContactRole (caseObj) {
      var contact = _.find(caseObj.contacts, {
        contact_id: getSelectedUserId()
      });

      return contact ? contact.role : 'No Role Associated';
    }

    /**
     * Gets user id of the contact's page visited
     *
     * @return {String} user id if user is not selected then current logged in user id
     */
    function getSelectedUserId () {
      var url = new URL(window.location.href);

      return url.searchParams.get('cid') !== null ? url.searchParams.get('cid') : CRM.config.user_contact_id;
    }

    /**
     * Inititate events subscribers
     */
    function initSubscribers () {
      $rootScope.$on('civicase::contact-record-case::refresh-cases', function () {
        resetGlobals();
        loadCases();
      });
    }

    /**
     * Load lists of open cases
     */
    function loadCases () {
      $scope.loaded = false;

      crmApi(getCaseApiParams($scope.page)).then(function (res) {
        var items = res.cases.values;

        _.each(items, function (item, ind) {
          if ($scope.caseType === 'Related') {
            item.contact_role = getContactRole(item);
          }
          $scope.cases.push(formatCase(item));
        });

        if ($scope.cases.length === res.count) {
          $scope.isLoadMoreAvailable = false;
        }

        $scope.loaded = true;
        $scope.$emit('civicase::contact-record-case::cases-loaded', items, $scope.caseType, $scope.page.num);
        $scope.page.num += 1;
      });
    }

    /**
     * resets scope values
     */
    function resetGlobals () {
      $scope.page = {size: $scope.pagerSize || defaultPageSize, num: 1};
      $scope.cases = [];
      $scope.loaded = false;
      $scope.isLoadMoreAvailable = true;
      $scope.loadingPlaceholders = _.range($scope.page.size || defaultPageSize);
    }
  }
})(angular, CRM.$, CRM._);
