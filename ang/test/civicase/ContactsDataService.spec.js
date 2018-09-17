/* eslint-env jasmine */
(function (_) {
  describe('ContactsDataService', function () {
    var $q, $rootScope, ContactsDataService, ContactsData, crmApi;

    beforeEach(function () {
      module('civicase', 'civicase.data');
    });

    beforeEach(inject(function (_$q_, _$rootScope_, _ContactsDataService_, _ContactsData_, _crmApi_) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      ContactsDataService = _ContactsDataService_;
      ContactsData = _ContactsData_;
      crmApi = _crmApi_;
    }));

    describe('basic tests', function () {
      it('has the correct interface', function () {
        expect(ContactsDataService).toEqual(jasmine.objectContaining({
          add: jasmine.any(Function),
          getImageUrlOf: jasmine.any(Function),
          getContactIconOf: jasmine.any(Function)
        }));
      });
    });

    describe('add()', function () {
      var expectedApiParams;

      beforeEach(function () {
        expectedApiParams = {
          'sequential': 1,
          'return': [
            'birth_date',
            'city',
            'contact_type',
            'display_name',
            'email',
            'gender',
            'image_URL',
            'postal_code',
            'state_province',
            'street_address',
            'tags'
          ],
          'api.Phone.get': {
            'contact_id': '$value.id',
            'phone_type_id.name': { 'IN': [ 'Mobile', 'Phone' ] },
            'return': [ 'phone', 'phone_type_id.name' ]
          },
          'api.GroupContact.get': {
            'contact_id': '$value.id',
            'return': [ 'title' ]
          }
        };
      });

      describe('when called for the first time', function () {
        beforeEach(function () {
          _.extend(expectedApiParams, { 'id': { 'IN': ContactsData.values } });

          ContactsDataService.add(ContactsData.values);
        });

        it('gets the details of sent contacts', function () {
          expect(crmApi).toHaveBeenCalledWith('Contact', 'get', expectedApiParams);
        });
      });

      describe('when called from second time onwards', function () {
        var contactsForTheFirstCall, contactsForTheSecondCall;

        beforeEach(function () {
          contactsForTheFirstCall = [ContactsData.values[0]];
          ContactsDataService.add(contactsForTheFirstCall);
          contactsForTheSecondCall = [ContactsData.values[1]];

          _.extend(expectedApiParams, { 'id': { 'IN': contactsForTheSecondCall } });
          ContactsDataService.add(contactsForTheSecondCall);
        });

        it('gets the details of new contacts only', function () {
          expect(crmApi.calls.mostRecent().args).toEqual(['Contact', 'get', expectedApiParams]);
        });
      });
    });

    describe('getCachedContact()', function () {
      var expectedContact, returnedContact;

      describe('when the contact exists', function () {
        beforeEach(function () {
          var phones;

          crmApi.and.returnValue($q.resolve(ContactsData));
          ContactsDataService.add(ContactsData.values);
          $rootScope.$digest();

          expectedContact = _.clone(ContactsData.values[0]);
          phones = _.indexBy(expectedContact['api.Phone.get'].values, 'phone_type_id.name');

          expectedContact.mobile = phones['Mobile'];
          expectedContact.phone = phones['Phone'];
          expectedContact.groups = _.map(expectedContact['api.GroupContact.get'].values, 'title').join(', ');

          delete expectedContact['api.Phone.get'];
          delete expectedContact['api.GroupContact.get'];

          returnedContact = ContactsDataService.getCachedContact(ContactsData.values[0].contact_id);
        });

        it('returns the cached contact', function () {
          expect(returnedContact).toEqual(expectedContact);
        });
      });

      describe('when the contact does not exist', function () {
        beforeEach(function () {
          crmApi.and.returnValue($q.resolve(ContactsData));
          ContactsDataService.add(ContactsData.values);
          $rootScope.$digest();

          returnedContact = ContactsDataService.getCachedContact(_.random(100, 1000));
        });

        it('returns null', function () {
          expect(returnedContact).toEqual(null);
        });
      });
    });

    describe('getImageUrlOf()', function () {
      var returnValue;

      beforeEach(function () {
        crmApi.and.returnValue($q.resolve(ContactsData));
        ContactsDataService.add(ContactsData.values);
        $rootScope.$digest();
        returnValue = ContactsDataService.getImageUrlOf(ContactsData.values[0].contact_id);
      });

      it('gets the image url of sent contact id', function () {
        expect(returnValue).toBe(ContactsData.values[0].image_URL);
      });
    });

    describe('getContactIconOf()', function () {
      var returnValue;

      beforeEach(function () {
        crmApi.and.returnValue($q.resolve(ContactsData));
        ContactsDataService.add(ContactsData.values);
        $rootScope.$digest();
        returnValue = ContactsDataService.getContactIconOf(ContactsData.values[0].contact_id);
      });

      it('gets the contact type of sent contact id', function () {
        expect(returnValue).toBe(ContactsData.values[0].contact_type);
      });
    });
  });
})(CRM._);
