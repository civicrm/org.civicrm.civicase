(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseFileList', function () {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/FileList.html',
      controller: civicaseFileListController,
      scope: {
        apiCtrl: '=civicaseFileList',
        bulkAllowed: '='
      }
    };
  });

  /**
   * Controlle for File List
   *
   * @param {Object} $scope
   * @param {Object} crmApi
   * @param {Object} crmBlocker
   * @param {Object} crmStatus
   */
  function civicaseFileListController ($scope, crmApi) {
    $scope.ts = CRM.ts('civicase');

    (function init () {
      $scope.$watchCollection('apiCtrl.result', apiCtrlWatcher);
    }());

    /**
     * Watcher function for apiCtrl.result collection
     *
     * @params {Object} response
     */
    function apiCtrlWatcher (response) {
      // prettier html
      $scope.values = response.values;
      $scope.xref = response.xref;
      // Pre-sorting: (a) cast to array and (b) ensure stable check of isSameDate()
      $scope.activities = response.xref ? _.sortBy(response.xref.activity, 'activity_date_time').reverse() : [];

      $scope.filesByAct = {};
      _.each(response.values, function (match) {
        if (!$scope.filesByAct[match.activity_id]) {
          $scope.filesByAct[match.activity_id] = [];
        }
        $scope.filesByAct[match.activity_id].push(response.xref.file[match.id]);
      });
    }
  }
})(angular, CRM.$, CRM._);
