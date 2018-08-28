(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('ContactsData', ContactsDataService);

  function ContactsDataService (crmApi) {
    var contacts = [];
    var contactDetails = [];

    /**
     * Add data to the ContactsData service and fetches Profile Pic and Contact Type
     *
     * @param {array} data
     */
    this.add = function (data) {
      contacts = _.uniq(contacts.concat(data));

      return crmApi('Contact', 'get', {
        sequential: 1,
        return: ['image_URL', 'contact_type'],
        id: {IN: contacts}
      }).then(function (data) {
        contactDetails = _.indexBy(data.values, 'contact_id');
      });
    };

    /**
     * Returns the Profile Pic for the given contact id
     *
     * @param {String} contactID
     * @return {String}
     */
    this.getImageUrlOf = function (contactID) {
      return contactDetails[contactID] ? contactDetails[contactID].image_URL : '';
    };

    /**
     * Returns the Contact Type for the given contact id
     *
     * @param {String} contactID
     * @return {String}
     */
    this.getContactIconOf = function (contactID) {
      return contactDetails[contactID] ? contactDetails[contactID].contact_type : '';
    };
  }
})(angular, CRM.$, CRM._);
