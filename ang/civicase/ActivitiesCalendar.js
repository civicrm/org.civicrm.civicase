(function (angular) {
  var module = angular.module('civicase');

  module.component('civicaseActivitiesCalendar', {
    bindings: {
      activities: '='
    },
    controller: activitiesCalendar,
    controllerAs: 'activitiesCalendar',
    templateUrl: '~/civicase/ActivitiesCalendar.html'
  });

  function activitiesCalendar () {
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
    }
  }
})(angular);
