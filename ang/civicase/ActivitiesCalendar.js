(function ($, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseActivitiesCalendar', function ($timeout, $uibPosition) {
    return {
      scope: {
        activities: '=',
        caseId: '='
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
       * Opens up the activitis popover and binds the mouseup event in order
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
    $scope.calendarOptions = { showWeeks: false };
    $scope.selectedActivites = [];
    $scope.selectedDate = null;

    $scope.onDateSelected = onDateSelected;

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
})(CRM.$, angular);
