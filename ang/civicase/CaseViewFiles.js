(function(angular, $, _) {

  function caseFilesController($scope, crmThrottle, crmApi) {
    var ts = $scope.ts = CRM.ts('civicase'),
      item = $scope.item;

    var fileQuery = $scope.fileQuery = {
      apiParams: {
        case_id: item.id,
        text: '',
        options: {xref: 1}
      },
      apiResult: {}
    };
    function refresh() {
      crmThrottle(function(){
        return crmApi('Case', 'getfiles', fileQuery.apiParams)
          .then(function(response){
            fileQuery.apiResult = response;
          });
      });
    }
    $scope.$watchCollection("fileQuery.apiParams", refresh);
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
