/* eslint-env jasmine */
(function ($) {
  describe('civicaseCaseCard', function () {
    var element, $compile, $rootScope, $scope, CasesData, pastDate, futureDate;

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

      it('calculates all other overdue activities count', function () {
        expect(element.isolateScope().data.category_count.overdue.other).toBe(6);
      });
    });

    describe('formatDate()', function () {
      it('checks the format of the date', function () {
        expect(element.isolateScope().formatDate(moment())).toBe('07/09/2018');
      });
    });

    describe('isOverdue()', function () {
      beforeEach(function () {
        pastDate = moment().subtract(7, 'd');
        futureDate = moment().add(7, 'd');
      });

      it('checks the date is overdue ', function () {
        expect(element.isolateScope().isOverdue(pastDate)).toBe(true);
      });

      it('checks the date is not overdue ', function () {
        expect(element.isolateScope().isOverdue(futureDate)).toBe(false);
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
