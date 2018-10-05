/* eslint-env jasmine */

(function ($) {
  describe('ActivityCard', function () {
    var $compile, $rootScope, $scope, activityCard;

    beforeEach(module('civicase', 'civicase.templates'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

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

    /**
     * Initializes the ActivityCard directive
     */
    function initDirective () {
      $scope = $rootScope.$new();
      $scope.activity = {};

      activityCard = $compile('<div case-activity-card="activity"></div>')($scope);
      $rootScope.$digest();
    }
  });
})(CRM.$);
