/* eslint-env jasmine */

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
    describe('when called for the first time', function () {
      beforeEach(function () {
        ContactsDataService.add(ContactsData.values);
      });

      it('gets the details of sent contacts', function () {
        expect(crmApi).toHaveBeenCalledWith('Contact', 'get', {
          sequential: 1,
          return: ['image_URL', 'contact_type'],
          id: {IN: ContactsData.values}
        });
      });
    });

    describe('when called from second time onwards', function () {
      var contactsForTheFirstCall, contactsForTheSecondCall;

      beforeEach(function () {
        contactsForTheFirstCall = [ContactsData.values[0]];
        ContactsDataService.add(contactsForTheFirstCall);
        contactsForTheSecondCall = [ContactsData.values[1]];
        ContactsDataService.add(contactsForTheSecondCall);
      });

      it('gets the details of new contacts only', function () {
        expect(crmApi.calls.mostRecent().args).toEqual(['Contact', 'get', {
          sequential: 1,
          return: ['image_URL', 'contact_type'],
          id: {IN: contactsForTheSecondCall}
        }]);
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
