(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivitiesCalendar', function ($timeout, $uibPosition) {
    return {
      scope: {
        caseId: '=',
        refresh: '=refreshCallback'
      },
      controller: 'civicaseActivitiesCalendarController',
      templateUrl: '~/civicase/ActivitiesCalendar.html',
      restrict: 'E',
      link: civicaseActivitiesCalendarLink
    };

    /**
     * AngularJS's link function for the civicase activity calendar directive.
     *
     * @param {Object} $scope
     * @param {Object} element
     */
    function civicaseActivitiesCalendarLink ($scope, element) {
      var datepickerScope;
      var bootstrapThemeContainer = $('#bootstrap-theme');
      var popover = element.find('.activities-calendar-popover');
      var popoverArrow = popover.find('.arrow');

      (function init () {
        $scope.$on('civicase::ActivitiesCalendar::openActivitiesPopover', openActivitiesPopover);
        $scope.$on('civicase::ActivitiesCalendar::refreshDatepicker', function () {
          datepickerScope = datepickerScope || element.find('[uib-datepicker]').isolateScope();

          datepickerScope.datepicker.refreshView();
        });
      })();

      /**
       * Adjusts the position of the popover element if hidden by the window's limits.
       * For example, if the popover is hidden by the right window limit, it will position
       * the popover relative to the bottom left of the element.
       *
       * @param {Object} element a jQuery reference to the element to position the popover against.
       */
      function adjustPopoverIfHiddenByWindowsLimits (element) {
        var popoverArrowWidth = 22; // needs to be harcoded because how it is defined in Bootstrap
        var isHidden = {
          right: popover.position().left + popover.width() > $(window).width(),
          left: popover.position().left - popover.width() < 0
        };

        if (isHidden.right) {
          adjustPopoverToElement({
            element: element,
            direction: 'bottom-right',
            arrowPosition: 'calc(100% - ' + popoverArrowWidth + 'px)',
            arrowAdjustment: (popoverArrowWidth / 2)
          });
        } else if (isHidden.left) {
          adjustPopoverToElement({
            element: element,
            direction: 'bottom-left',
            arrowPosition: popoverArrowWidth + 'px',
            arrowAdjustment: -(popoverArrowWidth / 2)
          });
        }
      }

      /**
       * Adjusts the popover's position against the provided element and in the desired position direction.
       *
       * @param {Object} adjustments
       * @param {Object} adjustments.element the jQuery reference to the element to position the popover against.
       * @param {String} adjustments.direction the direction to position the popover against. Can be one of top, left, bottom, right,
       *   or combinations such as bottom-right, etc.
       * @param {String} adjustments.arrowPosition the popover's arrow position
       * @param {Number} adjustments.arrowAdjustment this value can be used to make small adjustments to the popover
       *   based on the position of the arrow so they can be aligned properly.
       */
      function adjustPopoverToElement (adjustments) {
        var bodyOffset = $uibPosition.positionElements(adjustments.element, popover, adjustments.direction, true);

        popoverArrow.css('left', adjustments.arrowPosition);
        popover.css({
          left: bodyOffset.left - bootstrapThemeContainer.offset().left + adjustments.arrowAdjustment
        });
      }

      /**
       * Closes the activities dropdown but only when clicking outside the popover
       * container. Also unbinds the mouseup event in order to reduce the amount
       * of active DOM event listeners.
       *
       * @param {Event} event DOM event triggered by the user mouse up action.
       */
      function closeActivitiesDropdown (event) {
        // Note: it breaks when checking `popover.is(event.target)`.
        var isNotPopover = !$(event.target).is('.activities-calendar-popover');
        var notInsidePopover = popover.has(event.target).length === 0;

        if (isNotPopover && notInsidePopover) {
          popover.hide();
          $(document).unbind('mouseup', closeActivitiesDropdown);
        }
      }

      /**
       * Displays the popover on top of the calendar's current active day.
       */
      function displayPopoverOnTopOfActiveDay () {
        // the current active day can only be determined in the next cicle:
        $timeout(function () {
          var activeDay = element.find('.uib-day .active');

          popover.show();
          popover.appendTo(bootstrapThemeContainer);

          positionPopoverOnTopOfElement(activeDay);

          // reset popover arrow's alignment:
          popoverArrow.css('left', '50%');

          adjustPopoverIfHiddenByWindowsLimits(activeDay);
        });
      }

      /**
       * Opens up the activities popover and binds the mouseup event in order
       * to close the popover.
       */
      function openActivitiesPopover () {
        displayPopoverOnTopOfActiveDay();
        $(document).bind('mouseup', closeActivitiesDropdown);
      }

      /**
       * Positions the popover on top of the given element
       *
       * @param {Object} element a jQuery reference to the element to position the popover against.
       */
      function positionPopoverOnTopOfElement (element) {
        var bodyOffset = $uibPosition.positionElements(element, popover, 'bottom', true);

        popover.css({
          top: bodyOffset.top - bootstrapThemeContainer.offset().top,
          left: bodyOffset.left - bootstrapThemeContainer.offset().left
        });
      }
    }
  });

  module.controller('civicaseActivitiesCalendarController', civicaseActivitiesCalendarController);

  function civicaseActivitiesCalendarController ($q, $rootScope, $scope, crmApi,
    formatActivity, ContactsDataService) {
    var daysWithActivities = {};

    $scope.loadingActivities = false;
    $scope.selectedActivites = [];
    $scope.selectedDate = null;
    $scope.calendarOptions = {
      customClass: getDayCustomClass,
      formatDay: 'd',
      showWeeks: false,
      startingDay: 1
    };

    /**
     * Called when the user clicks on a day on the datepicker directive
     *
     * If the day has any activities on it, it loads the activities and display
     * them in a popover
     */
    $scope.onDateSelected = function () {
      var date = moment($scope.selectedDate).format('YYYY-MM-DD');

      if (!daysWithActivities[date]) {
        return;
      }

      $scope.loadingActivities = true;
      $scope.selectedActivites = [];

      $scope.$emit('civicase::ActivitiesCalendar::openActivitiesPopover');

      loadActivitiesOfDate(date)
        .then(function (activities) {
          loadContactsOfActivities(activities)
            .then(function () {
              $scope.selectedActivites = activities;
              $scope.loadingActivities = false;
            });
        });
    };

    (function init () {
      $rootScope.$on('civicase::uibDaypicker::compiled', load);
      $rootScope.$on('civicase::ActivitiesCalendar::reload', reload);
    }());

    /**
     * Adds the given days to the internal list of days with activities, assigning
     * the given status to each of them.
     *
     * A 'completed' day won't be added to the list, if a day marked with
     * 'incomplete' already exists. The only exception is if the 'completed' day
     * is marked to be flushed.
     *
     * @param {Object} days api response
     * @param {String} status
     */
    function addDays (days, status) {
      days.values.reduce(function (acc, date) {
        var keepDay = acc[date] && acc[date].status === 'incomplete' && !acc[date].toFlush;

        acc[date] = keepDay ? acc[date] : {
          status: status,
          activitiesCache: []
        };
        // If this function is ran during a refresh, this ensures that the day
        // won't be removed by the "flush" phase, given that it still has activities
        acc[date].toFlush = false;

        return acc;
      }, daysWithActivities);
    }

    /**
     * Deletes the days with the given status that have not been updated
     * in the last refresh (ie they had activites initially, but now they haven't anymore)
     *
     * @param {String} status
     */
    function flushDays (status) {
      _.forEach(daysWithActivities, function (day, date) {
        day.status === status && day.toFlush && (delete daysWithActivities[date]);
      });
    }

    /**
     * Prepares the value of the case_id api param based on the $scope.caseId property
     *
     * @return {Number/Object}
     */
    function getCaseIdApiParam () {
      return _.isArray($scope.caseId) ? { 'IN': $scope.caseId } : $scope.caseId;
    }

    /**
     * Returns the class that the given date should have depending on the status
     * of all the activities for the date.
     *
     * @param {Object} params
     * @param {Date}   params.date the given date that requires the class
     * @param {String} params.mode the current viewing mode of the calendar.
     *   can be "day", "month", or "year".
     */
    function getDayCustomClass (params) {
      var classSuffix = '';
      var day = daysWithActivities[moment(params.date).format('YYYY-MM-DD')];
      var isInCurrentMonth = this.datepicker.activeDate.getMonth() === params.date.getMonth();

      if (!isInCurrentMonth && params.mode === 'day') {
        return 'invisible';
      }

      if (!day || params.mode !== 'day') {
        return;
      }

      if (day.status === 'completed') {
        classSuffix = 'completed';
      } else if (moment(params.date).isSameOrAfter(moment.now())) {
        classSuffix = 'scheduled';
      } else {
        classSuffix = 'overdue';
      }

      return 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--' + classSuffix;
    }

    /**
     * Entry point of the load logic
     */
    function load () {
      loadDaysWithActivitiesIncomplete()
        .then(function () {
          $scope.$emit('civicase::ActivitiesCalendar::refreshDatepicker');
        })
        .then(loadDaysWithActivitiesCompleted)
        .then(function () {
          $scope.$emit('civicase::ActivitiesCalendar::refreshDatepicker');
        });
    }

    /**
     * Loads via the api all the activities of the current case, filtered by
     * the given query params
     *
     * @param {Object} params
     * @return {Promise} resolves to {Array}
     */
    function loadActivities (params) {
      params = params || {};

      if ($scope.caseId) {
        params['case_id.id'] = getCaseIdApiParam();
      }

      return crmApi('Activity', 'get', _.assign(params, {
        'return': [
          'subject', 'details', 'activity_type_id', 'status_id',
          'source_contact_name', 'target_contact_name', 'assignee_contact_name',
          'activity_date_time', 'is_star', 'original_id', 'tag_id.name', 'tag_id.description',
          'tag_id.color', 'file_id', 'is_overdue', 'case_id', 'priority_id',
          'case_id.case_type_id', 'case_id.status_id', 'case_id.contacts'
        ],
        sequential: 1,
        options: {
          limit: 0
        }
      }))
        .then(function (result) {
          return result.values;
        });
    }

    /**
     * Loads the activities of the given date. It checks if the activities are
     * already cached before making an API request
     *
     * @param {String} date YYYY-MM-DD
     * @return {Promise} resolves to {Array}
     */
    function loadActivitiesOfDate (date) {
      var day = daysWithActivities[date];

      if (day.activitiesCache.length) {
        return $q.resolve(day.activitiesCache);
      }

      return loadActivities({
        activity_date_time: {
          BETWEEN: [ date + ' 00:00:00', date + ' 23:59:59' ]
        }
      })
        .then(function (activities) {
          day.activitiesCache = activities.map(formatActivity);

          return day.activitiesCache;
        });
    }

    /**
     * Load the data of all the contacts referenced by the given activities
     *
     * @param {Array} activities
     * @return {Promise}
     */
    function loadContactsOfActivities (activities) {
      var contactIds = _(activities).pluck('case_id.contacts').flatten().pluck('contact_id').value();

      return ContactsDataService.add(contactIds);
    }

    /**
     * Loads the dates with at least an activity with the given status(es)
     *
     * @param {*} statusParam
     * @return {Promise}
     */
    function loadDaysWithActivities (statusParam) {
      var params = {};

      params.status_id = statusParam;

      if ($scope.caseId) {
        params.case_id = getCaseIdApiParam();
      }

      return crmApi('Activity', 'getdayswithactivities', params);
    }

    /**
     * Loads the days with at least a completed activity
     *
     * @return {Promise}
     */
    function loadDaysWithActivitiesCompleted () {
      return loadDaysWithActivities(CRM.civicase.activityStatusTypes.completed[0])
        .then(_.curryRight(updateDaysList)('completed'));
    }

    /**
     * Loads the days with at least an incomplete activity
     *
     * @return {Promise}
     */
    function loadDaysWithActivitiesIncomplete () {
      return loadDaysWithActivities({
        'IN': CRM.civicase.activityStatusTypes.incomplete
      })
        .then(_.curryRight(updateDaysList)('incomplete'));
    }

    /**
     * It marks all the days currently in the internal list to be deleted, before
     * triggering the main load logic
     *
     * This ensures that if some days won't be returned again from any of the
     * API calls, they will be deleted
     */
    function reload () {
      _.each(daysWithActivities, function (day) {
        day.toFlush = true;
      });

      load();
    }

    /**
     * Update the internal list of days with activities with the specified status
     *
     * It adds the given days and deletes those that are marked for deletion
     *
     * @param {Object} days api response
     * @param {String} status
     */
    function updateDaysList (days, status) {
      addDays(days, status);
      flushDays(status);
    }
  }
})(CRM.$, CRM._, angular);
