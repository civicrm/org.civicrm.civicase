(function(angular, $, _) {

  angular.module('sandbox').config(function($routeProvider) {
      $routeProvider.when('/sandbox', {
        reloadOnSearch: false,
        controller: 'SandboxFooCtrl',
        templateUrl: '~/sandbox/FooCtrl.html'
      });
    }
  );

  angular.module('sandbox').controller('SandboxFooCtrl', function($scope, crmApi, crmStatus, crmUiHelp) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/sandbox/FooCtrl'}); // See: templates/CRM/sandbox/FooCtrl.hlp

    $scope.$bindToRoute('contactFilters', 'contacts', {
      contact_type: 'Individual'
    });

    $scope.$bindValueToRoute('activeTab', 'tab', 'summary');
    $scope.selectTab = function(name) { $scope.activeTab = name; };
    $scope.tabs = [
      {name: 'summary', label: 'Summary'},
      {name: 'activities', label: 'Activities'},
      {name: 'people', label: 'People'},
      {name: 'files', label: 'Files'}
    ];

    $scope.$bindValueToRoute('activeCid', 'cid');
    $scope.$watch('activeCid', function(){
      if ($scope.activeCid) {
        crmApi('Contact', 'getsingle', {
          id: $scope.activeCid
        }).then(function(result){
          $scope.myContact = result;
        });
      } else {
        $scope.myContact = {};
      }
      refreshActivities();
    });

    $scope.$bindToRoute('activityFilters', 'aj', {});
    $scope.$watchCollection('activityFilters', refreshActivities);
    function refreshActivities(){
      if ($scope.activeCid) {
        var p = angular.extend({contact_id: $scope.activeCid}, $scope.activityFilters);
        if (p.activity_type_id == '') delete p.activity_type_id;
        crmApi('Activity', 'get', p).then(function(r){
          $scope.activities = r;
        });
      }
      else {
        $scope.activities = [];
      }
    }

    $scope.openContact = function(cid) {
      $scope.activeCid = cid;
    };

    $scope.CRM = CRM;
  });

})(angular, CRM.$, CRM._);
