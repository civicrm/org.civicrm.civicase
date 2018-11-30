(function (angular) {
  var module = angular.module('civicase');

  module.directive('civicaseContactPopoverContent', function () {
    return {
      controller: 'civicaseContactPopoverContentController',
      templateUrl: '~/civicase/ContactPopoverContent.html',
      scope: {
        contactId: '<'
      }
    };
  });

  module.controller('civicaseContactPopoverContentController', function ($scope, ContactsDataService) {
    $scope.contact = ContactsDataService.getCachedContact($scope.contactId);
  });
})(angular);
