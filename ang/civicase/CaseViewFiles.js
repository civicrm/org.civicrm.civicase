(function(angular, $, _) {

  function caseFilesController($scope, crmThrottle, crmApi) {
    var ts = $scope.ts = CRM.ts('civicase'),
      item = $scope.item;

    $scope.fileFilters = {text: ''};
    $scope.fileData = {};
    function refresh() {
      crmThrottle(function(){
        return crmApi('Case', 'getfiles', {
          case_id: item.id,
          text: $scope.fileFilters.text,
          options: {xref: 1}
        })
          .then(function(response){
            $scope.fileData = response;
          });
      });
    }
    $scope.$watchCollection("fileFilters", refresh);
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
