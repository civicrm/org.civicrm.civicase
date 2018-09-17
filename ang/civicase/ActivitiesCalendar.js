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
  }
})(angular);
