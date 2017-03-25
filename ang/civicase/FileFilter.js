(function(angular, $, _) {

  function FileFilterCtrl($scope, crmThrottle, crmApi) {
    var ts = $scope.ts = CRM.ts('civicase'),
      fileQuery = $scope.fileQuery;
  }

  angular.module('civicase').directive('civicaseFileFilter', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/FileFilter.html',
      controller: FileFilterCtrl,
      scope: {
        fileQuery: '=civicaseFileFilter'
      }
    };
  });

})(angular, CRM.$, CRM._);
