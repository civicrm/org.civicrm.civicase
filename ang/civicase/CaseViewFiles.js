(function(angular, $, _) {

  function caseFilesController($scope, crmApi) {
    var ts = $scope.ts = CRM.ts('civicase'),
      item = $scope.item;
  }

  angular.module('civicase').directive('civicaseViewFiles', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/CaseViewFiles.html',
      controller: caseFilesController,
      scope: {
        item: '=civicaseViewFiles'
      }
    };
  });

})(angular, CRM.$, CRM._);
