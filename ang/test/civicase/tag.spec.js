/* eslint-env jasmine */

(function (colorContrast) {
  describe('civicaseTag', function () {
    var $controller, $rootScope, $scope, mockTag;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;

      mockTag = {
        'tag_id.name': 'mock name',
        'tag_id.description': 'mock description'
      };
    }));

    describe('default colour', function () {
      beforeEach(function () {
        initController(mockTag);
      });

      it('defines a default hex colour', function () {
        expect($scope.defaultColour).toBe('#0071bd');
      });
    });

    describe('text colour', function () {
      describe('when the tag colour is dark', function () {
        beforeEach(function () {
          mockTag['tag_id.color'] = '#333333';

          initController(mockTag);
        });

        it('defines the text colour as white', function () {
          expect($scope.textColour).toBe('white');
        });
      });

      describe('when the tag colour is light', function () {
        beforeEach(function () {
          mockTag['tag_id.color'] = '#cccccc';

          initController(mockTag);
        });

        it('defines the text colour as black', function () {
          expect($scope.textColour).toBe('black');
        });
      });

      describe('when no colour is defined', function () {
        var expectedTextColour;

        beforeEach(function () {
          initController(mockTag);

          expectedTextColour = colorContrast($scope.defaultColour);
        });

        it('defines the text colour as the contrast of the default one', function () {
          expect($scope.textColour).toBe(expectedTextColour);
        });
      });
    });

    function initController (tag) {
      $scope = $rootScope.$new();
      $scope.tag = tag;

      $controller('civicaseTagController', {
        $scope: $scope
      });
    }
  });
})(CRM.utils.colorContrast);
