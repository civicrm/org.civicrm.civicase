(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseFileFilter', function () {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/case/case-details/file-tab/file-filter.directive.html',
      controller: civicaseFileFilterController,
      scope: {
        fileFilter: '=civicaseFileFilter'
      }
    };
  });

  /**
   * Controller for civicaseFileFilter directive
   *
   * @params {Object} $scope
   */
  function civicaseFileFilterController ($scope) {
    $scope.ts = CRM.ts('civicase');
    $scope.fileCategoriesIT = CRM.civicase.fileCategories;
    $scope.activityCategories = CRM.civicase.activityCategories;
    $scope.customFilters = {
      grouping: ''
    };

    (function init () {
      $scope.$watchCollection('customFilters', customFiltersWatcher);
    })();

    /**
     * Watcher for customFilters property
     */
    function customFiltersWatcher () {
      if (!_.isEmpty($scope.customFilters.grouping)) {
        $scope.fileFilter.params['activity_type_id.grouping'] = {'LIKE': '%' + $scope.customFilters.grouping + '%'};
      } else {
        delete $scope.fileFilter.params['activity_type_id.grouping'];
      }
    }
  }
})(angular, CRM.$, CRM._);
