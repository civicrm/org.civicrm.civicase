(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityMonthNav', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '~/civicase/activity/feed/directives/activity-month-nav.directive.html',
      controller: 'civicaseActivityMonthNavController'
    };
  });

  module.controller('civicaseActivityMonthNavController', civicaseActivityMonthNavController);

  function civicaseActivityMonthNavController ($scope, crmApi) {
    $scope.navigateToMonth = navigateToMonth;

    (function init () {
      initWatchers();
    }());

    /**
     * Checks if the first record of the month is already rendered
     *
     * @param {Object} monthObj
     */
    function checkIfMonthIsAlreadyLoaded (monthObj) {
      var selector = '[data-offset-number="' + monthObj.startingOffset + '"]';

      return $(selector).length > 0;
    }

    /**
     * Subscribe listener for civicaseActivityFeed.query
     *
     * @param {Object} event
     * @param {Object} filters
     * @param {Object} params
     * @param {Boolean} reset
     * @param {Boolean} overdueFirst
     */
    function feedQueryListener (event, filters, params, reset, overdueFirst) {
      var apiCalls = getAPICalls(overdueFirst, params);

      return crmApi(apiCalls).then(function (result) {
        initGroups();

        if (overdueFirst) {
          groupOverdueByYear(result.months_with_overdue.values);
          groupOthersByYear(result.months_wo_overdue.values);
        } else {
          groupOthersByYear(result.months.values);
        }

        $scope.groups = _.filter($scope.groups, function (group) {
          return group.records.length > 0;
        });

        setStartingOffsets();
      });
    }

    /**
     * Get API calls to load the months for the month nav
     *
     * @param {Boolean} overdueFirst
     * @param {Object} params
     * @return {Array}
     */
    function getAPICalls (overdueFirst, params) {
      var apiCalls;

      if (overdueFirst) {
        apiCalls = {
          months_wo_overdue: [
            'Activity', 'getmonthswithactivities',
            $.extend(true, {is_overdue: 0}, params)
          ],
          months_with_overdue: [
            'Activity', 'getmonthswithactivities',
            $.extend(true, {is_overdue: 1}, params)
          ]
        };
      } else {
        apiCalls = {
          months: [
            'Activity', 'getmonthswithactivities', params
          ]
        };
      }

      return apiCalls;
    }

    /**
     * Group Dates into year and month for the given category
     *
     * @param {Array} category
     * @param {Object} dateObject
     * @param {Boolean} isOverDueGroup
     */
    function groupByYearFor (category, dateObject, isOverDueGroup) {
      var yearObject = _.find(category.records, function (yearObj) {
        return yearObj.year === dateObject.year;
      });

      var monthObject = {
        count: dateObject.count,
        isOverDueGroup: !!isOverDueGroup,
        month: dateObject.month,
        year: dateObject.year,
        monthName: moment(dateObject.month, 'MM').format('MMMM')
      };

      if (yearObject) {
        yearObject.months.push(monthObject);
      } else {
        category.records.push({
          year: dateObject.year,
          months: [monthObject]
        });
      }
    }

    /**
     * Group Months into year
     *
     * @param {Array} monthsArray
     */
    function groupOthersByYear (monthsArray) {
      var current = {
        month: moment(new Date()).format('MM'),
        year: moment(new Date()).format('Y')
      };

      _.each(monthsArray, function (dateObject) {
        var categoryNameForCurrentDateObject;

        if (dateObject.year === current.year && dateObject.month === current.month) {
          categoryNameForCurrentDateObject = 'now';
        } else if ((dateObject.year < current.year) ||
          (dateObject.year === current.year && dateObject.month < current.month)) {
          categoryNameForCurrentDateObject = 'past';
        } else if ((dateObject.year > current.year) ||
          (dateObject.year === current.year && dateObject.month > current.month)) {
          categoryNameForCurrentDateObject = 'future';
        }

        var categoryForCurrentDateObject = _.find($scope.groups, function (group) {
          return group.groupName === categoryNameForCurrentDateObject;
        });

        groupByYearFor(categoryForCurrentDateObject, dateObject);
      });
    }

    /**
     * Group Overdue Activity Months into year
     *
     * @param {Array} monthsArray
     */
    function groupOverdueByYear (monthsArray) {
      var overdueGroup = _.find($scope.groups, function (group) {
        return group.groupName === 'overdue';
      });

      _.each(monthsArray, function (dateObject) {
        groupByYearFor(overdueGroup, dateObject, true);
      });
    }

    /**
     * Initialise the Group object for the directive
     */
    function initGroups () {
      $scope.groups = [
        { groupName: 'overdue', records: [] },
        { groupName: 'future', records: [] },
        { groupName: 'now', records: [] },
        { groupName: 'past', records: [] }
      ];
    }

    /**
     * Initialise different watchers
     */
    function initWatchers () {
      $scope.$on('civicaseActivityFeed.query', feedQueryListener);
    }

    /**
     * Click event for the months of the month nav
     * If the month is already rendered in the screen,
     *  scrolls to the first record of the month
     * If Not, emits an event with the starting offset for that month
     *
     * @param {Object} monthObj
     */
    function navigateToMonth (monthObj) {
      if (!checkIfMonthIsAlreadyLoaded(monthObj)) {
        $scope.$emit('civicase::month-nav::clicked', {
          startingOffset: monthObj.startingOffset
        });
      } else {
        scrollAndHighlight(monthObj);
      }
    }

    /**
     * Scrolls and Highlights the first records of the month
     *
     * @param {Object} monthObj
     */
    function scrollAndHighlight (monthObj) {
      var selector = '[data-offset-number=' + monthObj.startingOffset + ']';
      var element = $(selector);

      element[0].scrollIntoView({ behavior: 'smooth' });
      element.effect('highlight', {}, 3000);
    }

    /**
     * Sets the starting offset for each month
     */
    function setStartingOffsets () {
      var offset = 0;

      _.each($scope.groups, function (group) {
        _.each(group.records, function (record) {
          _.each(record.months, function (month) {
            month.startingOffset = offset;
            offset += month.count;
          });
        });
      });
    }
  }
})(angular, CRM.$, CRM._, CRM);
