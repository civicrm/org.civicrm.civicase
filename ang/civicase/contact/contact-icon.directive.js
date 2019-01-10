(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseContactIcon', function () {
    return {
      controller: 'civicaseContactIconController',
      templateUrl: '~/civicase/contact/contact-icon.directive.html',
      scope: {
        autoCloseOtherPopovers: '<?',
        contactId: '<'
      }
    };
  });

  module.controller('civicaseContactIconController', function ($scope, ContactsCache) {
    (function init () {
      $scope.contactIcon = ContactsCache.getContactIconOf($scope.contactId);
    })();
  });
})(angular);
