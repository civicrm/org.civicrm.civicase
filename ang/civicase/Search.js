(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseSearch', function () {
    return {
      replace: true,
      templateUrl: '~/civicase/Search.html',
      controller: 'civicaseSearchController',
      link: civicaseSearchLink,
      scope: {
        defaults: '=filters',
        hiddenFilters: '=',
        onSearch: '@',
        expanded: '='
      }
    };

    /**
     * Link function for the directive
     *
     * @param {Object} scope
     * @param {Object} element
     * @param {Object} attr
    */

    function civicaseSearchLink (scope, element, attr) {
      /**
       * The logic is for disabling chrome autofills. New chrome version needs auto complete to be set to 'new-password'.
       * Refer - https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
       * This should be the part of select 2 library implementation and till this is not implemented in the select2 library,
       * this should be kept here.
       *
       * Todo -
       * Move this logic into crmUiSelect Directive so that this can be implemented for all input single select elements.
       */
      $('input[autocomplete]', element).attr('autocomplete', 'new-password');
    }
  });

  /**
   * Controller Function for civicase-search directive
   *
   * @param {object} $scope
   * @param {object} $timeout
   */
  module.controller('civicaseSearchController', function ($scope, $timeout) {
    // The ts() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = CRM.civicase.caseStatuses;
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
      },
      tag_id: {
        label: ts('Tags')
      }
    };
    var caseRelationshipConfig = [
      {
        'text': 'All Cases',
        'id': 'all'
      }, {
        'text': 'My cases',
        'id': 'is_case_manager'
      }, {
        'text': 'Cases I am involved',
        'id': 'is_involved'
      }
    ];

    $scope.caseTypeOptions = _.map(caseTypes, mapSelectOptions);
    $scope.caseStatusOptions = _.map(caseStatuses, mapSelectOptions);
    $scope.customGroups = CRM.civicase.customSearchFields;
    $scope.caseRelationshipOptions = caseRelationshipConfig;
    $scope.checkPerm = CRM.checkPerm;
    $scope.filterDescription = buildDescription();
    $scope.filters = angular.extend({}, $scope.defaults);

    (function init () {
      setCustomSearchFieldsAsSearchFilters();

      $scope.$watch('expanded', expandedWatcher);
      $scope.$watch('relationshipType', relationshipTypeWatcher);
      $scope.$watchCollection('filters', filtersWatcher);
    }());

    /**
     * Watcher for expanded state and update tableHeader top offset likewise
     */
    function expandedWatcher () {
      $timeout(function () {
        var bodyPadding = parseInt($('body').css('padding-top'), 10); // to see the space for fixed menus
        var $tableHeader = $('.civicase__case-list-table__header');
        var topPos = $tableHeader.offset().top - bodyPadding;
        $tableHeader.affix({
          offset: {
            top: topPos
          }
        });
      });
    }

    /**
     * Watcher for relationshipType filter
     */
    function relationshipTypeWatcher () {
      if ($scope.relationshipType) {
        $scope.relationshipType[0] === 'is_case_manager' ? $scope.filters.case_manager = [CRM.config.user_contact_id] : delete ($scope.filters.case_manager);
        $scope.relationshipType[0] === 'is_involved' ? $scope.filters.contact_id = [CRM.config.user_contact_id] : delete ($scope.filters.contact_id);
      }
    }

    /**
     * Watcher for filter collection to update the search
     * Only works when dropdown is unexpanded
     */
    function filtersWatcher () {
      if (!$scope.expanded) {
        $scope.doSearch();
      }
    }

    /**
     * Check/Uncheck `Show deleted` filters
     *
     * @param {object} $event - event object of Event API
     */
    $scope.toggleIsDeleted = function ($event) {
      var pressedSpaceOrEnter = $event.type === 'keydown' && ($event.keyCode === 32 || $event.keyCode === 13);

      if ($event.type === 'click' || pressedSpaceOrEnter) {
        $scope.filters.is_deleted = !$scope.filters.is_deleted;
        $event.preventDefault();
      }
    };

    /**
     * Show filter only when not hidden
     * This is configured from the backend
     *
     * @param {string} field - key of the field to be checked for
     * @return {Boolean} - boolean value if the filter is enabled
     */
    $scope.isEnabled = function (field) {
      return !$scope.hiddenFilters || !$scope.hiddenFilters[field];
    };

    /**
     * Checks if the current logged in user is a case manager
     */
    $scope.caseManagerIsMe = function () {
      return $scope.filters.case_manager && $scope.filters.case_manager.length === 1 && parseInt($scope.filters.case_manager[0], 10) === CRM.config.user_contact_id;
    };

    /**
     * Setup filter params and call search API
     * to feed results for cases
     */
    $scope.doSearch = function () {
      $scope.filterDescription = buildDescription();
      $scope.expanded = false;
      $scope.$parent.$eval($scope.onSearch, {
        selectedFilters: formatSearchFilters($scope.filters)
      });
    };

    /**
     * Resets filter options and reload search items
     */
    $scope.clearSearch = function () {
      $scope.filters = {};
      $scope.doSearch();
    };

    /**
     * Map the option parameter from API
     * to show up correctly on the UI.
     *
     * @param {object} opt object for caseTypes
     * @return {object} mapped value to be used in UI
     */
    function mapSelectOptions (opt) {
      return {
        id: opt.value || opt.name,
        text: opt.label || opt.title,
        color: opt.color,
        icon: opt.icon
      };
    }

    /**
     * Formats search fitler as per the API request header format
     *
     * @params {object} inp - Object for input option to be formatted
     * @return (object} search - returns formatted key value pair of filters
     */
    function formatSearchFilters (inp) {
      var search = {};
      _.each(inp, function (val, key) {
        if (!_.isEmpty(val) || ((typeof val === 'number') && val) || ((typeof val === 'boolean') && val)) {
          search[key] = val;
        }
      });
      return search;
    }

    /**
     * Builds human readable filter description to be shown on the UI
     *
     * @return {Array} des - Arrayed output to be shown as the fitler description with human readable key value pair
     */
    function buildDescription () {
      var des = [];
      _.each($scope.filters, function (val, key) {
        var field = allSearchFields[key];
        if (field) {
          var d = {label: field.label};
          if (field.options) {
            var text = [];
            _.each(val, function (o) {
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
              var k = _.findKey(val, function () { return true; });
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
      return des;
    }

    /**
     * Set custom search fields to search filter fields object
     */
    function setCustomSearchFieldsAsSearchFilters () {
      _.each(CRM.civicase.customSearchFields, function (group) {
        _.each(group.fields, function (field) {
          allSearchFields['custom_' + field.id] = field;
        });
      });
    }
  });
})(angular, CRM.$, CRM._);
