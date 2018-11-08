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
        $scope.$on('civicaseActivitiesCalendar::openActivitiesPopover', openActivitiesPopover);
        $scope.$on('civicaseActivitiesCalendar::refreshDatepicker', function () {
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

  function civicaseActivitiesCalendarController ($rootScope, $scope, crmApi) {
    var daysWithActivities = {};

    $scope.loading = false;
    $scope.selectedActivites = [];
    $scope.selectedDate = null;
    $scope.calendarOptions = {
      customClass: getDayCustomClass,
      formatDay: 'd',
      showWeeks: false,
      startingDay: 1
    };

    $scope.onDateSelected = function () {
    };

    (function init () {
      $scope.loading = true;

      $rootScope.$on('uibDaypicker::compiled', function () {
        loadDaysWithActivitiesIncomplete()
          .then(function () {
            $scope.$emit('civicaseActivitiesCalendar::refreshDatepicker');
            $scope.loading = false;
          })
          .then(loadDaysWithActivitiesCompleted)
          .then(function () {
            $scope.$emit('civicaseActivitiesCalendar::refreshDatepicker');
          });
      });
    }());

    /**
     * Adds the given days to the internal list of days with activities, assigning
     * the given status to each of them.
     *
     * A day won't be added to the list, if already exists a day marked with 'incomplete'
     *
     * @param {Object} days api response
     * @param {String} status
     */
    function addDays (days, status) {
      days.values.reduce(function (acc, val) {
        acc[val] = acc[val] && acc[val].status === 'incomplete'
          ? acc[val]
          : { status: status };

        return acc;
      }, daysWithActivities);
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
     * Loads the dates with at least an activity with the given status(es)
     *
     * @param {*} statusParam
     * @return {Promise}
     */
    function loadDaysWithActivities (statusParam) {
      return crmApi('Activity', 'getdayswithactivities', {
        case_id: $scope.caseId,
        status_id: statusParam
      });
    }

    /**
     * Loads the days with at least a completed activity
     *
     * @return {Promise}
     */
    function loadDaysWithActivitiesCompleted () {
      return loadDaysWithActivities(CRM.civicase.activityStatusTypes.completed[0])
        .then(_.curryRight(addDays)('completed'));
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
        .then(_.curryRight(addDays)('incomplete'));
    }
  }
})(CRM.$, CRM._, angular);
