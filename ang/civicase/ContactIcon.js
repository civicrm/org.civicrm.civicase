(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseContactIcon', function () {
    return {
      controller: 'civicaseContactIconController',
      templateUrl: '~/civicase/ContactIcon.html',
      scope: {
        autoCloseOtherPopovers: '<?',
        contactId: '<'
      }
    };
  });

  module.controller('civicaseContactIconController', function ($scope, ContactsDataService) {
    (function init () {
      $scope.contactIcon = ContactsDataService.getContactIconOf($scope.contactId);
    })();
  });
})(angular);
