(function(angular, $, _) {
  angular.module('crmRouteBinder', [
    'ngRoute'
  ]);

  // While processing a change from the $watch()'d data, we set the "internalUpdate" flag
  // so that automated URL changes don't cause a reload.
  var internalUpdate = false, activeTimer = null, registered = false;

  function registerGlobalListener($injector) {
    if (registered) return;
    registered = true;

    $injector.get('$rootScope').$on('$routeUpdate', function () {
      // Only reload if someone else -- like the user or an <a href> -- changed URL.
      if (!internalUpdate) {
        $injector.get('$route').reload();
      }
    });
  }

  angular.module('crmRouteBinder').config(function ($provide) {
    $provide.decorator('$rootScope', function ($delegate, $injector) {
      Object.getPrototypeOf($delegate).$bindToRoute = function (scopeVar, queryParam, queryDefaults) {
        registerGlobalListener($injector);

        var _scope = this;
        if (!queryDefaults) queryDefaults = {};

        var $route = $injector.get('$route'), $timeout = $injector.get('$timeout');

        if ($route.current.params[queryParam]) {
          _scope[scopeVar] = angular.fromJson($route.current.params[queryParam]);
        }
        else {
          _scope[scopeVar] = angular.extend({}, queryDefaults);
        }

        // Keep the URL bar up-to-date.
        _scope.$watchCollection(scopeVar, function (newFilters) {
          internalUpdate = true;

          var p = angular.extend({}, $route.current.params);
          p[queryParam] = angular.toJson(newFilters);
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

        if (!(scopeVar in _scope)) {
          _scope[scopeVar] = $route.current.params[queryParam] || queryDefault;
        }

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
