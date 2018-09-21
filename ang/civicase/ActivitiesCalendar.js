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
      var domObserver;
      var bootstrapThemeContainer = $('#bootstrap-theme');
      var popover = element.find('.activities-calendar-popover');

      (function init () {
        initDomWatchers();
        $scope.$on('civicaseActivitiesCalendar::openActivitiesPopover', openActivitiesPopover);
        $scope.$on('civicaseActivitiesCalendar::refreshDatepicker', function () {
          var datepickerScope = element.find('[uib-datepicker]').isolateScope();

          datepickerScope.datepicker.refreshView();
        });
      })();

      /**
       * Adds a class for the current week day in the calendar.
       */
      function addClassForCurrentWeekDay () {
        var currentWeekDay = moment().isoWeekday() - 1; // Force Monday as the first day
        if (currentWeekDay < 0) {
          currentWeekDay = 6;
        }
        var weekDayElement = element.find('thead tr:eq(1) th').eq(currentWeekDay);
        weekDayElement.addClass('current-week-day');
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
       * Executes DOM manipulations safely by disconnecting the DOM Observer first
       * and then reattching it after the DOM manipulations have been executed.
       *
       * @param {Function} domManipulation a function containing the manipulations
       * that will affect the DOM.
       */
      function executeDomManipulation (domManipulation) {
        domObserver.disconnect();
        domObserver.takeRecords();
        domManipulation();
        initDomWatchers();
      }

      /**
       * Initializes a DOM Mutation Observer that waits for changes to the
       * activity calendar elements and executes a sequence of DOM manipulations
       */
      function initDomWatchers () {
        domObserver = new window.MutationObserver(function () {
          executeDomManipulation(function () {
            splitWordsInCalendarTitle();
            useMaterialIconsForCalendarArrows();
            addClassForCurrentWeekDay();
          });
        });
        domObserver.observe(element.get(0), { childList: true, subtree: true });
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
       * Splits each word in the calendar title and wraps them into spans.
       * This can be useful for applying different styles to each word.
       */
      function splitWordsInCalendarTitle () {
        var titleElement = element.find('thead .uib-title strong');
        var title = titleElement.text();
        var titleWords = title.split(' ').map(function (word) {
          return $('<span></span>').text(word + ' ');
        });

        titleElement.html(titleWords);
      }

      /**
       * Changes the glyphicons for the calendar arrows and replaces them with
       * material icons.
       */
      function useMaterialIconsForCalendarArrows () {
        element.find('thead .glyphicon-chevron-left')
          .attr('class', 'material-icons')
          .text('chevron_left');
        element.find('thead .glyphicon-chevron-right')
          .attr('class', 'material-icons')
          .text('chevron_right');
      }
    }
  });

  module.controller('civicaseActivitiesCalendarController', civicaseActivitiesCalendarController);

  function civicaseActivitiesCalendarController ($scope, formatActivity) {
    $scope.calendarOptions = {
      customClass: getDayCustomClass,
      formatDay: 'd',
      showWeeks: false,
      startingDay: 1
    };
    $scope.selectedActivites = [];
    $scope.selectedDate = null;

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

      if (activities.length === 0 || params.mode !== 'day') {
        return;
      }
      allActivitiesHaveBeenCompleted = checkIfAllActivitiesHaveBeenCompleted(activities);

      if (isDateInThePast && !allActivitiesHaveBeenCompleted) {
        return 'civicase__activities-calendar__day-status-overdue';
      } else if (allActivitiesHaveBeenCompleted) {
        return 'civicase__activities-calendar__day-status-completed';
      } else {
        return 'civicase__activities-calendar__day-status-scheduled';
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
