/* eslint-env jasmine */

(function (_) {
  fdescribe('Contact Case Tab', function () {
    var $controller, $rootScope, $scope, mockContactId, mockContactService;

    beforeEach(module('civicase', function ($provide) {
      mockContactService = jasmine.createSpyObj('Contact', ['getContactIDFromUrl']);

      $provide.value('Contact', mockContactService);
    }));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
      mockContactId = _.uniqueId();

      mockContactService.getContactIDFromUrl.and.returnValue(mockContactId);
      initController();
    });

    describe('on init', function () {
      it('stores the contact id extracted from the URL', function () {
        expect($scope.contactId).toBe(mockContactId);
      });
    });

    /**
     * Initializes the contact case tab controller.
     */
    function initController () {
      $scope = $rootScope.$new();

      $controller('CivicaseContactCaseTabController', { $scope: $scope });
    }
  });
})(CRM._);
