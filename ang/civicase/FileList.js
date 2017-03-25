(function(angular, $, _) {

  function FileListCtrl($scope) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.$watchCollection('apiCtrl.result', function(r){
      // prettier html
      $scope.values = r.values;
      $scope.xref = r.xref;
    });
  }

  angular.module('civicase').directive('civicaseFileList', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/FileList.html',
      controller: FileListCtrl,
      scope: {
        apiCtrl: '=civicaseFileList'
      }
    };
  });

})(angular, CRM.$, CRM._);
