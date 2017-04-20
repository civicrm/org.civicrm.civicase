(function(angular, $, _) {

  angular.module('civicase').config(function($routeProvider) {
    $routeProvider.when('/case/:id', {
      template: '<h1 crm-page-title>{{ item ? item.client[0].display_name : ts("Loading") }} - {{ item.case_type }}</h1><div id="bootstrap-theme" class="civicase-main" civicase-view="caseId" civicase-item="item"></div>',
      controller: 'CivicaseCaseView'
    });
  });

  // CaseList route controller
  angular.module('civicase').controller('CivicaseCaseView', function($scope, $route) {
    $scope.caseId = $route.current.params.id;
    $scope.ts = CRM.ts('civicase');
    $scope.item = null;
  });

})(angular, CRM.$, CRM._);
