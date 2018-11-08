/* eslint-env jasmine */
/* global SimpleBar */
/* eslint-disable no-global-assign */
(function (_) {
  describe('civicaseCustomScrollbar', function () {
    var element, $compile, $rootScope, $scope, SimpleBarOriginalFunction, originalRootScopeOn;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
    }));

    describe('initiate SimpleBar', function () {
      beforeEach(function () {
        SimpleBarOriginalFunction = SimpleBar;
        SimpleBar = jasmine.createSpy('SimpleBar');
      });

      afterEach(function () {
        SimpleBar = SimpleBarOriginalFunction;
      });

      beforeEach(function () {
        compileDirective();
      });

      it('should call SimpleBar()', function () {
        expect(SimpleBar).toHaveBeenCalledWith(element[0], $scope.options);
      });
    });

    describe('add subscribers', function () {
      beforeEach(function () {
        originalRootScopeOn = $rootScope.$on;
        $rootScope.$on = jasmine.createSpy('rootScopeOn');
      });

      afterEach(function () {
        $rootScope.$on = originalRootScopeOn;
      });

      beforeEach(function () {
        compileDirective();
      });

      it('should call $rootScope.$on()', function () {
        expect($rootScope.$on).toHaveBeenCalledWith('civicase::custom-scrollbar::recalculate', jasmine.any(Function));
      });
    });

    /**
     * Initialise directive
     */
    function compileDirective () {
      $scope.options = {
        'autoHide': false
      };
      element = $compile('<div civicase-custom-scrollbar scrollbar-config="{{options}}"></div')($scope);
      $scope.$digest();
    }
  });
})(CRM._);
