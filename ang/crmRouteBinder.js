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
      Object.getPrototypeOf($delegate).$bindToRoute = function (options) {
        registerGlobalListener($injector);

        options.format = options.format || 'json';
        var _scope = this;
        if (!options.default) {
          options.default = (options.format === 'raw') ? '' : {};
        }

        var $route = $injector.get('$route'), $timeout = $injector.get('$timeout');

        // TODO: can we combine these two branches better?
        var initVal = null;
        if (options.format === 'raw') {
          initVal = (options.param in $route.current.params)
            ? $route.current.params[options.param]
            : options.default;
        }
        else if (options.format === 'json') {
          initVal = (options.param in $route.current.params)
            ? angular.fromJson($route.current.params[options.param])
            : angular.extend({}, options.default);
        }
        // TODO: try using $parse instead of _scope[options.expr].
        _scope[options.expr] = initVal;

        // Keep the URL bar up-to-date.
        var watchFunc = (options.format === 'raw') ? '$watch' : '$watchCollection';
        _scope[watchFunc](options.expr, function (newValue) {
          var encValue = (options.format === 'raw' ? newValue : angular.toJson(newValue));
          if ($route.current.params[options.param] === encValue) return;

          internalUpdate = true;

          // TODO: Consider buffering these changes so that concurrent updates only
          // cause one URL change.
          var p = angular.extend({}, $route.current.params);
          p[options.param] = encValue;
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
