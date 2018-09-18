(function ($, angular) {
  var module = angular.module('civicase');

  module.component('civicaseActivitiesCalendar', {
    bindings: {
      activities: '='
    },
    controller: activitiesCalendar,
    controllerAs: 'activitiesCalendar',
    templateUrl: '~/civicase/ActivitiesCalendar.html'
  });

  module.directive('civicaseActivitiesCalendarDomEvents', ['$uibPosition', function ($uibPosition) {
    return {
      link: function ($scope, element) {
        civicaseActivitiesCalendarDomEvents({
          $scope: $scope,
          $uibPosition: $uibPosition,
          element: element
        });
      }
    };
  }]);

  activitiesCalendar.$inject = ['$scope'];

  function activitiesCalendar ($scope) {
    var vm = this;

    vm.calendarOptions = { showWeeks: false };
    vm.selectedActivites = [];
    vm.selectedDate = null;

    vm.onDateSelected = onDateSelected;

    /**
     * It stores the activities that are on the same date as the calendar's
     * selected date. Triggers when the calendar date changes.
     */
    function onDateSelected () {
      vm.selectedActivites = vm.activities.filter(function (activity) {
        return moment(activity.activity_date_time).isSame(vm.selectedDate, 'day');
      });

      if (vm.selectedActivites.length) {
        $scope.$emit('civicaseActivitiesCalendar::openActivitiesPopover');
      }
    }
  }

  /**
   * Attaches events to the DOM for opening, hiding, and position the activities
   * calendar popover.
   *
   * @param {Object} dependencies
   * @param {Object} dependencies.$uibPosition - the $uibPosition service.
   * @param {Object} dependencies.$scope - the $scope where the directive is attached to.
   * @param {Object} dependencies.element - the element where the directive is attached to.
   */
  function civicaseActivitiesCalendarDomEvents (dependencies) {
    var $uibPosition = dependencies.$uibPosition;
    var $scope = dependencies.$scope;
    var bootstrapThemeContainer = $('#bootstrap-theme');
    var element = dependencies.element;
    var popover = element.find('.activities-calendar-popover');

    (function init () {
      $scope.$on('civicaseActivitiesCalendar::openActivitiesPopover', openActivitiesPopover);
    })();

    /**
     * Closes the activities dropdown but only when clicking outside the popover
     * container. Also unbinds the mouseup event in order to reduce the amount
     * of active DOM event listeners.
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
      setTimeout(function () {
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
})(CRM.$, angular);
