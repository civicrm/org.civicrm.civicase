/* eslint-env jasmine */

(function () {
  describe('civicaseTag', function () {
    var $controller, $rootScope, $scope, mockTags;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;

      mockTags = {
        1: {
          'tag_id.name': 'mock name',
          'tag_id.description': 'mock description'
        },
        2: {
          'tag_id.name': 'mock name 2',
          'tag_id.description': 'mock description 2'
        }
      };
    }));

    describe('on init', function () {
      beforeEach(function () {
        initController(mockTags);
        $scope.$digest();
      });

      it('converts the tags object into an array', function () {
        expect($scope.tagsArray).toEqual(Object.values(mockTags));
      });
    });

    /**
     * Initialise the controller
     *
     * @param {Object} tags
     */
    function initController (tags) {
      $scope = $rootScope.$new();
      $scope.tags = tags;

      $controller('civicaseTagsContainerController', {
        $scope: $scope
      });
    }
  });
})();
