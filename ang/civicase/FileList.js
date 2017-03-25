(function(angular, $, _) {

  function FileListCtrl($scope, crmThrottle, crmApi) {
    var ts = $scope.ts = CRM.ts('civicase'),
      fileQuery = $scope.fileQuery;
  }

  angular.module('civicase').directive('civicaseFileList', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/FileList.html',
      controller: FileListCtrl,
      scope: {
        fileQuery: '=civicaseFileList'
      }
    };
  });

})(angular, CRM.$, CRM._);
