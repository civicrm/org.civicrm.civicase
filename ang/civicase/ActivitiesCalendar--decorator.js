(function (angular) {
  var module = angular.module('civicase');

  module.config(function ($provide) {
    $provide.decorator('uibDaypickerDirective', function ($controller, $delegate) {
      var datepicker = $delegate[0];

      datepicker.controller = function ($scope, $element, dateFilter) {
        var vm = this;

        (function init () {
          var UibDaypickerController = $controller('UibDaypickerController', {
            $scope: $scope,
            $element: $element,
            dateFilter: dateFilter
          });

          angular.extend(vm, UibDaypickerController);

          $scope.currentWeekDay = getCurrentWeekDay();
        })();

        /**
         * Returns the current day of the week.
         *
         * @return {Number}
         */
        function getCurrentWeekDay () {
          var currentWeekDay = moment().isoWeekday() - 1; // Force Monday as the first day

          if (currentWeekDay < 0) {
            currentWeekDay = 6;
          }

          return currentWeekDay;
        }
      };

      return $delegate;
    });
  });
})(angular);
