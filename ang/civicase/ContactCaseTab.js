(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseTab', function () {
    return {
      restrict: 'EA',
      controller: CivicaseContactCaseTabController,
      templateUrl: '~/civicase/ContactCaseTab.html',
      scope: {}
    };
  });

  function CivicaseContactCaseTabController ($scope, crmApi, formatCase) {
    $scope.cases = [
      {
        'name': 'opened',
        'title': 'Open Cases',
        'filterParams': {
          'status_id.grouping': 'Opened',
          'contact_id': getSelectedContactId()
        },
        'isLoaded': false,
        'showSpinner': false,
        'cases': [],
        'isLoadMoreAvailable': false,
        'page': {
          'size': 3,
          'num': 1
        }
      }, {
        'name': 'closed',
        'title': 'Closed Case',
        'filterParams': {
          'status_id.grouping': 'Closed',
          'contact_id': getSelectedContactId()
        },
        'isLoaded': false,
        'showSpinner': false,
        'cases': [],
        'isLoadMoreAvailable': false,
        'page': {
          'size': 3,
          'num': 1
        }
      }, {
        'name': 'related',
        'title': 'Other cases for this contact',
        'filterParams': {
          'case_manager': getSelectedContactId()
        },
        'isLoaded': false,
        'showSpinner': false,
        'cases': [],
        'isLoadMoreAvailable': false,
        'page': {
          'size': 3,
          'num': 1
        }
      }
    ];

    $scope.checkPerm = CRM.checkPerm;
    $scope.ts = CRM.ts('civicase');

    (function init () {
      initSubscribers();
      getCases();
    }());

    /**
     * refresh function to set refresh cases
     */
    $scope.refresh = function () {
      $scope.$emit('civicase::contact-record-case::refresh-cases');
    };

    /**
     * Watcher for civicase::contact-record-list::loadmore event
     *
     * @params {Object} event
     * @params {String} name of the list
     */
    function contactRecordListLoadmoreWatcher (event, name) {
      var ind = _.findIndex($scope.cases, function (caseObj) {
        return caseObj.name === name;
      });
      var params = getCaseApiParams($scope.cases[ind].filterParams, $scope.cases[ind].page);

      $scope.cases[ind].showSpinner = true;
      updateCase(ind, params);
    }

    /**
     * Initiate cases
     */
    function getCases () {
      var totalCountApi = [];

      _.each($scope.cases, function (item, ind) {
        var params = getCaseApiParams(item.filterParams, item.page);

        updateCase(ind, params);
        totalCountApi.push(params.count);
      });

      getTotalCasesCount(totalCountApi);
    }

    /**
     * Get parameters to load cases
     *
     * @param {object} filters
     * @param {object} sort
     * @param {object} page
     *
     * @return {array}
     */
    function getCaseApiParams (filter, page) {
      var caseReturnParams = [
        'subject', 'details', 'contact_id', 'case_type_id', 'status_id',
        'contacts', 'start_date', 'end_date', 'is_deleted', 'activity_summary',
        'activity_count', 'category_count', 'tag_id.name', 'tag_id.color',
        'tag_id.description', 'tag_id.parent_id', 'related_case_ids'
      ];
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

      return {
        cases: ['Case', 'getcaselist', $.extend(true, returnCaseParams, filter, params)],
        count: ['Case', 'getcount', $.extend(true, returnCaseParams, filter, params)]
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
        contact_id: getSelectedContactId()
      });

      return contact ? contact.role : 'No Role Associated';
    }

    /**
     * Fetches count of all the cases a contact have
     */
    function getTotalCasesCount (apiCall) {
      var count = 0;

      crmApi(apiCall).then(function (response) {
        _.each(response, function (ind) {
          count += ind;
        });

        $scope.totalCount = count;
      });
    }

    /**
     * Gets user id of the contact's page visited
     *
     * @return {String} user id if user is not selected then current logged in user id
     */
    function getSelectedContactId () {
      var url = new URL(window.location.href);

      return url.searchParams.get('cid') !== null ? url.searchParams.get('cid') : CRM.config.user_contact_id;
    }

    /**
     * Subscribers for events
     */
    function initSubscribers () {
      $scope.$on('civicase::contact-record-list::loadmore', contactRecordListLoadmoreWatcher);
    }

    /**
     * Updates the list with new entries
     *
     * @params {String} ind
     * @params {Array} params
     */
    function updateCase (ind, params) {
      crmApi(params).then(function (response) {
        _.each(response.cases.values, function (item) {
          if ($scope.cases[ind].isRelated) {
            item.contact_role = getContactRole(item);
          }

          $scope.cases[ind].cases.push(formatCase(item));
        });

        $scope.cases[ind].isLoaded = true;
        $scope.cases[ind].showSpinner = false;
        $scope.cases[ind].page.num += 1;
        $scope.cases[ind].isLoadMoreAvailable = $scope.cases[ind].cases.length < response.count;
      });
    }
  }
})(angular, CRM.$, CRM._);
