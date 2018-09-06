/* eslint-env jasmine */
(function ($) {
  describe('caseCard', function () {
    var element, $compile, $rootScope, $scope, CasesData, date;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _CasesData_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      CasesData = _CasesData_;
      date = CasesData.values[0].activity_summary.milestone[0].activity_date_time || new Date();
    }));

    describe('basic tests', function () {
      beforeEach(function () {
        compileDirective(CasesData.values[0]);
      });

      it('complies the case card directive', function () {
        expect(element.hasClass('civicase__case-card')).toBe(true);
      });

      it('calculates all other incomplete tasks count', function () {
        expect(element.isolateScope().data.category_count.incomplete.other).toMatch(/\d{1,}/);
      });

      it('calculates all other overdue tasks count', function () {
        expect(element.isolateScope().data.category_count.overdue.other).toMatch(/\d{1,}/);
      });

      it('checks the format of the date', function () {
        expect(element.isolateScope().formatDate(date)).toMatch(/^(([0,1,2]\d{1})|3[0,1])\/((1[0,1,2])|0\d)\/\d{4}$/);
      });

      it('checks the isOverdue return value', function () {
        expect(element.isolateScope().isOverdue(date)).toBe(true);
      });
    });

    /**
     * Function responsible for setting up compilation of the directive
     * @param {Object} Case card object
     */
    function compileDirective (casObj) {
      element = $compile('<civicase-case-card case="case"></civicase-case-card>')($scope);
      $scope.case = casObj;
      $scope.$digest();
    }
  });
}(CRM.$));
