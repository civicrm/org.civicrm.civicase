(function(angular, $, _) {

  function FileFilterCtrl($scope) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.fileCategoriesIT = CRM.civicase.fileCategories;
    $scope.customFilters = {
      showLetters: false
    };
    $scope.$watchCollection('customFilters', function() {
      if ($scope.customFilters.showLetters) {
        $scope.apiCtrl.params.activity_type_id = 'Print PDF Letter';
      }
      else {
        delete $scope.apiCtrl.params.activity_type_id;
      }
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
