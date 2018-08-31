(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('ContactsDataService', ContactsDataService);

  function ContactsDataService (crmApi) {
    var savedContacts = [];
    var savedContactDetails = {};

    /**
     * Add data to the ContactsData service and fetches Profile Pic and Contact Type
     *
     * @param {array} contacts
     */
    this.add = function (contacts) {
      contacts = _.uniq(contacts);
      var newContacts = _.difference(contacts, savedContacts);
      savedContacts = savedContacts.concat(newContacts);

      return crmApi('Contact', 'get', {
        sequential: 1,
        return: ['image_URL', 'contact_type'],
        id: {IN: newContacts}
      }).then(function (data) {
        savedContactDetails = _.extend(savedContactDetails, _.indexBy(data.values, 'contact_id'));
      });
    };

    /**
     * Returns the Profile Pic for the given contact id
     *
     * @param {String} contactID
     * @return {String}
     */
    this.getImageUrlOf = function (contactID) {
      return savedContactDetails[contactID] ? savedContactDetails[contactID].image_URL : '';
    };

    /**
     * Returns the Contact Type for the given contact id
     *
     * @param {String} contactID
     * @return {String}
     */
    this.getContactIconOf = function (contactID) {
      return savedContactDetails[contactID] ? savedContactDetails[contactID].contact_type : '';
    };
  }
})(angular, CRM.$, CRM._);
