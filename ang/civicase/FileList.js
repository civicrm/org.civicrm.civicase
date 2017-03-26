(function(angular, $, _) {

  function FileListCtrl($scope) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.$watchCollection('apiCtrl.result', function(r){
      // prettier html
      $scope.values = r.values;
      $scope.xref = r.xref;

      $scope.filesByAct = {};
      _.each(r.values, function(match){
        if (!$scope.filesByAct[match.activity_id]) {
          $scope.filesByAct[match.activity_id] = [];
        }
        $scope.filesByAct[match.activity_id].push(r.xref.file[match.id]);
      });
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
