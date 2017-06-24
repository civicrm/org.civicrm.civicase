(function(angular, $, _) {
  angular.module('crmRouteBinder', CRM.angRequires('crmRouteBinder'));

  // While processing a change from the $watch()'d data, we set the "pendingUpdates" flag
  // so that automated URL changes don't cause a reload.
  var pendingUpdates = null, activeTimer = null, registered = false;

  function registerGlobalListener($injector) {
    if (registered) return;
    registered = true;

    $injector.get('$rootScope').$on('$routeUpdate', function () {
      // Only reload if someone else -- like the user or an <a href> -- changed URL.
      if (null === pendingUpdates) {
        $injector.get('$route').reload();
      }
    });
  }

  var formats = {
    json: {
      watcher: '$watchCollection',
      init: function($route, options) {
        return (options.param in $route.current.params) ? angular.fromJson($route.current.params[options.param]) : angular.extend({}, options.default);
      },
      encode: angular.toJson,
      default: {}
    },
    raw: {
      watcher: '$watch',
      init: function($route, options) {
        return (options.param in $route.current.params) ? $route.current.params[options.param] : options.default;
      },
      encode: function(v) { return v; },
      default: ''
    },
    int: {
      watcher: '$watch',
      init: function($route, options) {
        if (options.param in $route.current.params) {
          return parseInt($route.current.params[options.param]);
        }
        return options.default;
      },
      encode: function(v) { return v; },
      default: 0
    },
    bool: {
      watcher: '$watch',
      init: function($route, options) {
        if (options.param in $route.current.params) {
          return $route.current.params[options.param] === '1';
        }
        return options.default;
      },
      encode: function(v) { return v ? '1' : '0'; },
      default: false
    }
  };

  angular.module('crmRouteBinder').config(function ($provide) {
    $provide.decorator('$rootScope', function ($delegate, $injector) {
      Object.getPrototypeOf($delegate).$bindToRoute = function (options) {
        registerGlobalListener($injector);

        options.format = options.format || 'json';
        var fmt = formats[options.format];
        if (options.default === undefined) {
          options.default = fmt.default;
        }
        var _scope = this;

        var $route = $injector.get('$route'), $timeout = $injector.get('$timeout');

        // TODO: try using $parse...assign() instead of _scope[options.expr].
        _scope[options.expr] = fmt.init($route, options);

        // Keep the URL bar up-to-date.
        _scope[fmt.watcher](options.expr, function (newValue) {
          var encValue = fmt.encode(newValue);
          if ($route.current.params[options.param] === encValue) return;

          pendingUpdates = pendingUpdates || {};
          pendingUpdates[options.param] = encValue;
          var p = angular.extend({}, $route.current.params, pendingUpdates);
          $route.updateParams(p);

          if (activeTimer) $timeout.cancel(activeTimer);
          activeTimer = $timeout(function () {
            pendingUpdates = null;
            activeTimer = null;
          }, 50);
        });
      };

      return $delegate;
    });
  });

})(angular, CRM.$, CRM._);
