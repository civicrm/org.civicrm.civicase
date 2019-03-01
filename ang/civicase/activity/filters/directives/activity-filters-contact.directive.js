(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityFiltersContact', function () {
    return {
      restrict: 'AE',
      replace: true,
      templateUrl: '~/civicase/activity/filters/directives/activity-filters-contact.directive.html',
      scope: {
        filters: '=civicaseActivityFiltersContact'
      },
      link: civicaseActivityFiltersContactLink
    };

    /**
     * Link function for civicaseActivityFiltersContact
     *
     * @param {Object} $scope
     */
    function civicaseActivityFiltersContactLink ($scope) {
      $scope.ts = CRM.ts('civicase');

      (function init () {
        $scope.$watch('filters', filtersWatcher);
        $scope.$on('civicaseActivityFeed.query', feedQueryListener);
      }());

      /**
       * Watch listener for filters
       */
      function filtersWatcher () {
        // Ensure "All" checkbox renders.
        if ($scope.filters['@involvingContact'] === undefined) {
          $scope.filters['@involvingContact'] = '';
        }
      }

      /**
       * Subscribe listener for civicaseActivityFeed.query
       *
       * @param {Object} event
       * @param {Object} allParameters
       */
      function feedQueryListener (event, allParameters) {
        if (allParameters.reset) {
          delete allParameters.params.contact_id;
          delete allParameters.params.assignee_contact_id;
          delete allParameters.params.source_contact_id;
        }

        switch (allParameters.filters['@involvingContact']) {
          case 'myActivities':
            allParameters.params.contact_id = 'user_contact_id';
            break;

          case 'delegated':
            if (_.isEmpty(allParameters.params.assignee_contact_id)) {
              allParameters.params.assignee_contact_id = {'!=': 'user_contact_id'};
            }
            if (_.isEmpty(allParameters.params.source_contact_id)) {
              allParameters.params.source_contact_id = 'user_contact_id';
            }
            break;

          default:
            break;
        }
      }
    }
  });
})(angular, CRM.$, CRM._);
