(function(angular, $, _) {

  function caseFilesController($scope, crmApi) {
    var ts = $scope.ts = CRM.ts('civicase'),
      item = $scope.item;
  }

  angular.module('civicase').directive('civicaseUploader', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/CaseUploader.html',
      controller: caseFilesController,
      scope: {
        item: '=civicaseUploader'
      }
    };
  });

})(angular, CRM.$, CRM._);
