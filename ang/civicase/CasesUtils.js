(function (angular, _) {
  var module = angular.module('civicase');

  module.service('CasesUtils', function (ContactsDataService) {
    /**
     * Fetch additional information about the contacts
     *
     * @param {array} cases
     */
    this.fetchMoreContactsInformation = function (cases) {
      var contacts = [];

      _.each(cases, function (caseObj) {
        contacts = contacts.concat(getAllContactIdsForCase(caseObj));
      });

      ContactsDataService.add(contacts);
    };

    /**
     * Get all the contacts of the given case
     *
     * @param {object} caseObj
     * @return {array}
     */
    function getAllContactIdsForCase (caseObj) {
      var contacts = [];

      _.each(caseObj.contacts, function (currentCase) {
        contacts.push(currentCase.contact_id);
      });
      _.each(caseObj.allActivities, function (activity) {
        contacts = contacts.concat(activity.assignee_contact_id);
        contacts = contacts.concat(activity.target_contact_id);
        contacts.push(activity.source_contact_id);
      });

      return contacts;
    }
  });
})(angular, CRM._);
