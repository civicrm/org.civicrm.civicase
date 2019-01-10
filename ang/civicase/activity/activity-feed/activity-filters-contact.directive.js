(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityFiltersContact', function () {
    return {
      restrict: 'AE',
      replace: true,
      templateUrl: '~/civicase/activity/activity-feed/activity-filters-contact.directive.html',
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
       * @param {Object} filters
       * @param {Object} params
       * @param {Boolean} reset if it's necessary to delete the previously-set properties
       */
      function feedQueryListener (event, filters, params, reset) {
        if (reset) {
          delete params.contact_id;
          delete params.assignee_contact_id;
          delete params.source_contact_id;
        }

        switch (filters['@involvingContact']) {
          case 'myActivities':
            params.contact_id = 'user_contact_id';
            break;

          case 'delegated':
            if (_.isEmpty(params.assignee_contact_id)) {
              params.assignee_contact_id = {'!=': 'user_contact_id'};
            }
            if (_.isEmpty(params.source_contact_id)) {
              params.source_contact_id = 'user_contact_id';
            }
            break;

          default:
            break;
        }
      }
    }
  });
})(angular, CRM.$, CRM._);
