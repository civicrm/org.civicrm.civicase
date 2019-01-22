/* eslint-env jasmine */

(function ($) {
  describe('ActivityCard', function () {
    var $compile, $rootScope, $scope, activityCard, activitiesMockData;

    beforeEach(module('civicase', 'civicase.templates', 'civicase.data'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _activitiesMockData_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      activitiesMockData = _activitiesMockData_;

      $('<div id="bootstrap-theme"></div>').appendTo('body');
      initDirective();
    }));

    afterEach(function () {
      $('#bootstrap-theme').remove();
    });

    describe('on init', function () {
      it('stores a reference to the bootstrap theme element', function () {
        expect(activityCard.isolateScope().bootstrapThemeElement.is('#bootstrap-theme')).toBe(true);
      });
    });

    describe('when editing an activity in the popup', function () {
      var activity, loadFormSpy, crmUrlReturnVal, crmFormSuccessCallback;

      beforeEach(function () {
        crmUrlReturnVal = 'some string';
        activity = activitiesMockData.get()[0];

        loadFormSpy = jasmine.createSpyObj('loadForm', ['on']);
        loadFormSpy.on.and.callFake(function (event, fn) {
          crmFormSuccessCallback = fn;
        });

        CRM.loadForm.and.returnValue(loadFormSpy);
        CRM.url.and.returnValue(crmUrlReturnVal);

        activityCard.isolateScope().viewInPopup(null, activity);
      });

      it('prepares the url to open the activity modal', function () {
        expect(CRM.url).toHaveBeenCalledWith('civicrm/case/activity', {
          action: 'update',
          id: activity.id,
          caseid: activity.case_id,
          reset: 1
        });
      });

      it('opens the modal to edit the activity', function () {
        expect(CRM.loadForm).toHaveBeenCalledWith(crmUrlReturnVal);
      });

      it('listenes for the the form to be saved', function () {
        expect(loadFormSpy.on).toHaveBeenCalledWith('crmFormSuccess', jasmine.any(Function));
      });

      describe('when activity is saved', function () {
        beforeEach(function () {
          crmFormSuccessCallback();
        });

        it('refreshes the data when activity is saved', function () {
          expect(activityCard.isolateScope().refresh).toHaveBeenCalled();
        });
      });
    });

    /**
     * Initializes the ActivityCard directive
     */
    function initDirective () {
      $scope = $rootScope.$new();
      $scope.activity = {};
      $scope.refreshCallback = jasmine.createSpy('refreshCallback');

      activityCard = $compile('<div case-activity-card="activity" refresh-callback="refreshCallback"></div>')($scope);
      $rootScope.$digest();
    }
  });
})(CRM.$);
