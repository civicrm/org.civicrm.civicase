(function (angular) {
  var module = angular.module('civicase');

  module.config(function ($provide) {
    $provide.decorator('uibMonthpickerDirective', function ($controller, $delegate) {
      var datepicker = $delegate[0];

      datepicker.compile = function () {
        return function ($scope) {
          datepicker.link.apply(this, arguments);
          augmentMonthSelectMethod($scope, 'select');
        };
      };

      return $delegate;
    });

    $provide.decorator('uibDaypickerDirective', function ($controller, $delegate) {
      var datepicker = $delegate[0];

      datepicker.compile = function () {
        return function ($scope) {
          datepicker.link.apply(this, arguments);
          augmentMonthSelectMethod($scope, 'move');

          // Emits an event to signal that the directive is compiled and attached
          // to the DOM, with the currently selected date passed as param
          $scope.$emit('civicase::uibDaypicker::compiled', $scope.activeDt.date);
        };
      };

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

  /**
   * Augment the original month select method with the given name, by making it
   * emit an event with the selected month passed as param
   *
   * @param {Object} $scope
   * @param {String} methodName
   */
  function augmentMonthSelectMethod ($scope, methodName) {
    var originalMethod;

    originalMethod = $scope[methodName];
    $scope[methodName] = function () {
      originalMethod.apply(this, arguments);
      $scope.$emit('civicase::uibDaypicker::monthSelected', $scope.activeDt.date);
    };
  }
})(angular);
