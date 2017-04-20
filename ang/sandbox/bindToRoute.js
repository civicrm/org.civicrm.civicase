(function (angular, $, _) {
  var internalUpdate = false, activeTimer = null, registered = false;

  function registerGlobalListener($injector) {
    if (registered) return;
    registered = true;

    $injector.get('$rootScope').$on('$routeUpdate', function () {
      // Only reload if someone else -- like the user or an <a href> -- changed URL.
      if (!internalUpdate) {
        console.log('reload route');
        $injector.get('$route').reload();
      }
    });
  }

  angular.module('sandbox').config(function ($provide) {
    $provide.decorator('$rootScope', function ($delegate, $injector) {
      Object.getPrototypeOf($delegate).$bindToRoute = function (scopeVar, queryParam, queryDefaults) {
        registerGlobalListener($injector);

        var _scope = this;
        if (!queryDefaults) queryDefaults = {};

        var $route = $injector.get('$route'), $timeout = $injector.get('$timeout');

        if ($route.current.params[queryParam]) {
          _scope[scopeVar] = JSON.parse($route.current.params[queryParam]);
        }
        else {
          _scope[scopeVar] = angular.extend({}, queryDefaults);
        }

        // Keep the URL bar up-to-date.
        _scope.$watchCollection(scopeVar, function (newFilters) {
          internalUpdate = true;

          var p = angular.extend({}, $route.current.params);
          p[queryParam] = JSON.stringify(newFilters);
          $route.updateParams(p);

          if (activeTimer) $timeout.cancel(activeTimer);
          activeTimer = $timeout(function () {
            internalUpdate = false;
            activeTimer = null;
          }, 50);
        });
      };
      Object.getPrototypeOf($delegate).$bindValueToRoute = function (scopeVar, queryParam, queryDefault) {
        registerGlobalListener($injector);

        var _scope = this;
        var $route = $injector.get('$route'), $timeout = $injector.get('$timeout');

        _scope[scopeVar] = $route.current.params[queryParam] || queryDefault;

        // Keep the URL bar up-to-date.
        _scope.$watch(scopeVar, function (newValue) {
          internalUpdate = true;

          var p = angular.extend({}, $route.current.params);
          p[queryParam] = newValue;
          $route.updateParams(p);

          if (activeTimer) $timeout.cancel(activeTimer);
          activeTimer = $timeout(function () {
            internalUpdate = false;
            activeTimer = null;
          }, 50);
        });
      };

      return $delegate;
    });
  });

})(angular, CRM.$, CRM._);
