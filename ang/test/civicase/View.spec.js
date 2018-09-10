/* eslint-env jasmine */

describe('View', function () {
  var element, $compile, $rootScope, $scope, CasesData;

  beforeEach(module('civicase.templates', 'civicase', 'civicase.data'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _CasesData_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    CasesData = _CasesData_;

    $scope = $rootScope.$new();
  }));

  describe('basic tests', function () {
    beforeEach(function () {
      compileDirective();
    });

    it('complies the directive', function () {
      expect(element.html()).toContain('civicase-view-panel');
    });
  });

  describe('focusToggle()', function () {
    beforeEach(function () {
      compileDirective();
      element.isolateScope().isFocused = true;
      element.isolateScope().focusToggle();
    });

    it('toggles the focus state', function () {
      expect(element.isolateScope().isFocused).toBe(false);
    });
  });

  function compileDirective () {
    $scope.viewingCaseDetails = CasesData.values[0];
    element = $compile('<div civicase-view="viewingCaseDetails"></div>')($scope);
    $scope.$digest();
  }
});
