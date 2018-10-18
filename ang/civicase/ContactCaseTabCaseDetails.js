(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseTabCaseDetails', function () {
    return {
      restrict: 'EA',
      replace: true,
      controller: ContactCaseTabCaseDetailsController,
      templateUrl: '~/civicase/ContactCaseTabCaseDetails.html',
      scope: {
        item: '=selectedCase'
      }
    };
  });

  function ContactCaseTabCaseDetailsController ($scope) {
    $scope.getContactRole = function (caseObj) {
      var contact = _.find(caseObj.contacts, {
        contact_id: getSelectedContactId()
      });
      return contact ? contact.role : 'No Role Associated';
    };
    function getSelectedContactId () {
      var url = new URL(window.location.href);

      return url.searchParams.get('cid') !== null ? url.searchParams.get('cid') : CRM.config.user_contact_id;
    }
  }
})(angular, CRM.$, CRM._);
