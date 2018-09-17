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

  module.directive('civicaseActivitiesCalendarDomEvents', function () {
    return {
      link: civicaseActivitiesCalendarDomEvents
    };
  });

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

  function civicaseActivitiesCalendarDomEvents ($scope, element) {
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
      var isNotPopover = !popover.is(event.target);
      var notInsidePopover = popover.has(event.target).length === 0;

      if (isNotPopover && notInsidePopover) {
        popover.hide();
        $(document).unbind('mouseup', closeActivitiesDropdown);
      }
    }

    /**
     * Opens up the activitis popover and binds the mouseup event in order
     * to close the popover.
     */
    function openActivitiesPopover () {
      popover.show();
      $(document).bind('mouseup', closeActivitiesDropdown);
    }
  }
})(CRM.$, angular);
