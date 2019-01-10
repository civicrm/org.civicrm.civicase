(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseContactPopoverContent', function () {
    return {
      controller: 'civicaseContactPopoverContentController',
      templateUrl: '~/civicase/contact/contact-popover-content.directive.html',
      scope: {
        contactId: '<'
      }
    };
  });

  module.controller('civicaseContactPopoverContentController', function ($scope, ContactsCache) {
    $scope.contact = ContactsCache.getCachedContact($scope.contactId);
  });
})(angular);
