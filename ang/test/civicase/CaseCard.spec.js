/* eslint-env jasmine */
(function ($) {
  describe('civicaseCaseCard', function () {
    var element, $compile, $rootScope, $scope, CasesData;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _CasesData_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      CasesData = _CasesData_;
    }));

    beforeEach(function () {
      compileDirective(CasesData.values[0]);
    });

    describe('basic test', function () {
      it('complies the case card directive', function () {
        expect(element.hasClass('civicase__case-card')).toBe(true);
      });

      it('calculates all tasks which are incomplete count', function () {
        expect(element.isolateScope().data.category_count.incomplete.task).toBe(2);
      });
    });

    /**
     * Function responsible for setting up compilation of the directive
     * @param {Object} Case card object
     */
    function compileDirective (caseObj) {
      caseObj.allActivities = caseObj['api.Activity.get'].values;

      element = $compile('<civicase-case-card case="case"></civicase-case-card>')($scope);
      $scope.case = caseObj;
      $scope.$digest();
    }
  });
}(CRM.$));
