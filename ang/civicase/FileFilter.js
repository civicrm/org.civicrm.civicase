(function(angular, $, _) {

  function FileFilterCtrl($scope) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.fileCategoriesIT = _.map(CRM.civicase.fileCategories, function(v){
      return {id: v.value, text: v.label};
    });
  }

  angular.module('civicase').directive('civicaseFileFilter', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/FileFilter.html',
      controller: FileFilterCtrl,
      scope: {
        apiCtrl: '=civicaseFileFilter'
      }
    };
  });

})(angular, CRM.$, CRM._);
