(function(angular, $, _) {
  angular.module('sandbox').directive('sandboxContacts', function() {
    return {
      restrict: 'AE',
      templateUrl: '~/sandbox/Contacts.html',
      scope: {
        contactQuery: '=sandboxContacts'
      },
      link: function($scope, $el, $attr) {
        var ts = $scope.ts = CRM.ts('civicase');
      }
    };
  });
})(angular, CRM.$, CRM._);
