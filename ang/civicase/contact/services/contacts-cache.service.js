(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('ContactsCache', ContactsCache);

  function ContactsCache (crmApi, $q) {
    var defer;
    var savedContacts = [];
    var savedContactDetails = {};
    var requiredContactFields = [
      'birth_date',
      'city',
      'contact_type',
      'display_name',
      'email',
      'gender_id',
      'image_URL',
      'postal_code',
      'state_province',
      'street_address',
      'tag'
    ];

    /**
     * Add data to the ContactsData service and fetches Profile Pic and Contact Type
     *
     * @param {Array} contacts
     * @return {Promise} resolves to undefined when the information for the given contacts
     * has been fetched and stored.
     */
    this.add = function (contacts) {
      contacts = _.uniq(contacts);
      var newContacts = _.difference(contacts, savedContacts);
      savedContacts = savedContacts.concat(newContacts);

      if (newContacts.length === 0) {
        // if a previous API call is in progress wait for it to finish;
        return defer ? defer.promise : $q.resolve();
      }

      defer = $q.defer();

      return crmApi('Contact', 'get', {
        'sequential': 1,
        'id': { 'IN': newContacts },
        'return': requiredContactFields,
        'options': { 'limit': 0 },
        'api.Phone.get': {
          'contact_id': '$value.id',
          'phone_type_id.name': { 'IN': [ 'Mobile', 'Phone' ] },
          'return': [ 'phone', 'phone_type_id.name' ]
        },
        'api.GroupContact.get': {
          'contact_id': '$value.id',
          'return': [ 'title' ]
        },
        'api.EntityTag.get': {
          'entity_table': 'civicrm_contact',
          'entity_id': '$value.id',
          'return': [ 'tag_id.name', 'tag_id.description', 'tag_id.color' ]
        }
      }).then(function (data) {
        savedContactDetails = _.extend(savedContactDetails, _.indexBy(data.values, 'contact_id'));
        defer.resolve();
      });
    };

    /**
     * Returns the cached information for the given contact.
     *
     * @param {String} contactID
     * @return {Object} contact object of the passed contact ID.
     */
    this.getCachedContact = function (contactID) {
      var phones;
      var contact = _.clone(savedContactDetails[contactID]);

      if (!contact) {
        return null;
      }

      phones = _.indexBy(contact['api.Phone.get'].values, 'phone_type_id.name');
      contact.mobile = phones['Mobile'];
      contact.phone = phones['Phone'];
      contact.groups = _.map(contact['api.GroupContact.get'].values, 'title').join(', ');
      contact.tags = (contact.tags + '').split(',').join(', '); // Adds spacing to the tags

      delete contact['api.Phone.get'];
      delete contact['api.GroupContact.get'];

      return contact;
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
