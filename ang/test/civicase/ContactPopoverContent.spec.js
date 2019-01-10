/* eslint-env jasmine */

(function (_) {
  describe('ContactPopoverContent', function () {
    var $controller, $rootScope, $scope, contactsDataServiceMock;
    var mockContact = { id: _.uniqueId() };

    beforeEach(module('civicase', function ($provide) {
      contactsDataServiceMock = jasmine.createSpyObj('contactsDataService', ['getCachedContact']);
      contactsDataServiceMock.getCachedContact.and.returnValue(mockContact);

      $provide.value('ContactsCache', contactsDataServiceMock);
    }));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
      initController();
    });

    describe('when the directive initializes', function () {
      it('requests the contact information', function () {
        expect(contactsDataServiceMock.getCachedContact).toHaveBeenCalledWith($scope.contactId);
      });

      it('stores the contact information', function () {
        expect($scope.contact).toEqual(mockContact);
      });
    });

    /**
     * Initializes the contact popover content controller for testing purposes.
     */
    function initController () {
      $scope = $rootScope.$new();
      $scope.contactId = mockContact.id;

      $controller('civicaseContactPopoverContentController', { $scope: $scope });
    }
  });
})(CRM._);
