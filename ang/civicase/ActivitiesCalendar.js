(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivitiesCalendar', function ($timeout, $uibPosition) {
    return {
      scope: {
        activities: '=',
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
      var bootstrapThemeContainer = $('#bootstrap-theme');
      var popover = element.find('.activities-calendar-popover');

      (function init () {
        $scope.$on('civicaseActivitiesCalendar::openActivitiesPopover', openActivitiesPopover);
        $scope.$on('civicaseActivitiesCalendar::refreshDatepicker', function () {
          var datepickerScope = element.find('[uib-datepicker]').isolateScope();

          datepickerScope.datepicker.refreshView();
        });
      })();

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
          var bodyOffset = {};

          popover.show();
          popover.appendTo(bootstrapThemeContainer);

          bodyOffset = $uibPosition.positionElements(activeDay, popover, 'bottom', true);
          popover.css({
            top: bodyOffset.top - bootstrapThemeContainer.offset().top,
            left: bodyOffset.left - bootstrapThemeContainer.offset().left
          });
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
    }
  });

  module.controller('civicaseActivitiesCalendarController', civicaseActivitiesCalendarController);

  function civicaseActivitiesCalendarController ($scope, formatActivity) {
    $scope.selectedActivites = [];
    $scope.selectedDate = null;
    $scope.calendarOptions = {
      customClass: getDayCustomClass,
      formatDay: 'd',
      showWeeks: false,
      startingDay: 1
    };

    $scope.onDateSelected = onDateSelected;

    (function init () {
      $scope.$watch('activities', function () {
        $scope.$broadcast('civicaseActivitiesCalendar::refreshDatepicker');
      }, true);
    })();

    /**
     * Determines if all the given activities have been completed.
     *
     * @param {Array} activities
     */
    function checkIfAllActivitiesHaveBeenCompleted (activities) {
      return _.every(activities, function (activity) {
        return _.includes(CRM.civicase.activityStatusTypes.completed, +activity.status_id);
      });
    }

    /**
     * Returns the activities that belong to the given date.
     *
     * @param {Date} date
     */
    function getActivitiesForDate (date) {
      return $scope.activities.filter(function (activity) {
        return moment(activity.activity_date_time).isSame(date, 'day');
      });
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
      var allActivitiesHaveBeenCompleted;
      var activities = getActivitiesForDate(params.date);
      var isDateInThePast = moment().isAfter(params.date, 'day');
      var isInCurrentMonth = this.datepicker.activeDate.getMonth() === params.date.getMonth();

      if (!isInCurrentMonth && params.mode === 'day') {
        return 'invisible';
      }

      if (activities.length === 0 || params.mode !== 'day') {
        return;
      }

      allActivitiesHaveBeenCompleted = checkIfAllActivitiesHaveBeenCompleted(activities);

      if (allActivitiesHaveBeenCompleted) {
        return 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--completed';
      } else if (isDateInThePast) {
        return 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--overdue';
      } else {
        return 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--scheduled';
      }
    }

    /**
     * Stores the activities that are on the same date as the calendar's
     * selected date. Triggers when the calendar date changes.
     */
    function onDateSelected () {
      $scope.selectedActivites = $scope.activities
        .filter(function (activity) {
          return moment(activity.activity_date_time).isSame($scope.selectedDate, 'day');
        })
        .map(function (activity) {
          return formatActivity(activity, $scope.caseId);
        });

      if ($scope.selectedActivites.length) {
        $scope.$emit('civicaseActivitiesCalendar::openActivitiesPopover');
      }
    }
  }
})(CRM.$, CRM._, angular);
