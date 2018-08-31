/* eslint-env jasmine */
(function ($) {
  describe('contactCard', function () {
    var element, crmApi, $q, $compile, $document, $rootScope, $scope, ContactsData, ContactsDataService;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _$document_, _crmApi_, _ContactsData_, _ContactsDataService_) {
      $q = _$q_;
      $compile = _$compile_;
      $document = _$document_;
      $rootScope = _$rootScope_;
      crmApi = _crmApi_;
      ContactsData = _ContactsData_;
      ContactsDataService = _ContactsDataService_;
      $scope = $rootScope.$new();
    }));

    describe('basic tests', function () {
      beforeEach(function () {
        compileDirective(false);
      });

      it('complies the Action directive', function () {
        expect(element.html()).toContain('<!-- Contact Icons -->');
      });
    });

    describe('when contacts data are set', function () {
      beforeEach(function () {
        compileDirective(false, ContactsData.values[0].contact_id, ContactsData.values[0].display_name);
      });

      it('sets the display name and contact id of the sent contant', function () {
        expect(element.isolateScope().contacts).toEqual([{
          display_name: ContactsData.values[0].display_name,
          contact_id: ContactsData.values[0].contact_id
        }]);
      });
    });

    describe('when the contact card is of avatar type', function () {
      describe('when the display name is a name', function () {
        beforeEach(function () {
          compileDirective(true, 1, 'John Doe');
        });

        it('sets the initial of the name as the avatar', function () {
          expect(element.isolateScope().contacts[0].avatar).toBe('JD');
        });
      });

      describe('when the display name is an email', function () {
        beforeEach(function () {
          compileDirective(true, 1, 'example@example.com');
        });

        it('sets the first letter of the email address as the avatar', function () {
          expect(element.isolateScope().contacts[0].avatar).toBe('E');
        });
      });

      describe('image url', function () {
        beforeEach(function () {
          crmApi.and.returnValue($q.resolve(ContactsData));
          ContactsDataService.add(ContactsData.values);
          compileDirective(true, ContactsData.values[0].contact_id, ContactsData.values[0].display_name);
        });

        it('sets the image url for the sent contact', function () {
          expect(element.isolateScope().contacts[0].image_URL).toBe(ContactsData.values[0].image_URL);
        });
      });
    });

    describe('toggleDropdownVisibility', function () {
      var event;

      beforeEach(function () {
        event = { stopPropagation: jasmine.createSpy() };

        compileDirective(false);
        element.isolateScope().isPopupVisible = false;
        element.isolateScope().toggleDropdownVisibility(event);
      });

      it('toggles the dropdown visibility', function () {
        expect(element.isolateScope().isPopupVisible).toBe(true);
      });

      it('stops the click event from propagating', function () {
        expect(event.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('when clicked outside', function () {
      describe('when the clicked on the dropdown itself', function () {
        beforeEach(function () {
          compileDirective(false);
          $.fn.find = jasmine.createSpy();
          $.fn.find.and.returnValue([1]); // clicked on the dropdown
          element.isolateScope().isPopupVisible = true;
          $document.trigger('click');
        });

        it('does not change the dropdown visibility', function () {
          expect(element.isolateScope().isPopupVisible).toBe(true);
        });
      });

      describe('when the clicked outside', function () {
        beforeEach(function () {
          compileDirective(false);
          $.fn.find = jasmine.createSpy();
          $.fn.find.and.returnValue([]); // clicked outside
          element.isolateScope().isPopupVisible = true;
          $document.trigger('click');
        });

        it('changes the dropdown visibility', function () {
          expect(element.isolateScope().isPopupVisible).toBe(false);
        });
      });
    });

    function compileDirective (isAvatar, contactID, contactDisplayName) {
      element = $compile('<div contact-card contacts="contacts" avatar="isAvatar">')($scope);
      $scope.isAvatar = isAvatar;
      $scope.contacts = {};
      $scope.contacts[contactID] = contactDisplayName;
      $scope.$digest();
    }
  });
}(CRM.$));
