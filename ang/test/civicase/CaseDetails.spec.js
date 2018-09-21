/* eslint-env jasmine */

describe('civicaseCaseDetails', function () {
  var $provide, element, $compile, $rootScope, $scope, CasesData;

  beforeEach(module('civicase.templates', 'civicase', 'civicase.data', function (_$provide_) {
    $provide = _$provide_;
  }));

  beforeEach(inject(function () {
    var formatCaseMock = jasmine.createSpy('formatCase');
    formatCaseMock.and.callFake(function (data) {
      return data;
    });

    $provide.value('formatCase', formatCaseMock);
  }));

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
      expect(element.html()).toContain('civicase__case-header');
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

  describe('formatDate()', function () {
    var returnValue;

    beforeEach(function () {
      compileDirective();
      returnValue = element.isolateScope().formatDate('2018-09-14 18:29:45', 'DD MMMM YYYY');
    });

    it('returns the date in the sent format', function () {
      expect(returnValue).toBe('14 September 2018');
    });
  });

  describe('pushCaseData()', function () {
    beforeEach(function () {
      compileDirective();
      element.isolateScope().item = CasesData.values[0];
      element.isolateScope().item.allActivities = CasesData.values[0]['api.Activity.get.1'].values;

      element.isolateScope().pushCaseData(CasesData.values[0]);
    });

    it('calculates the incomplete tasks and scheduled activities', function () {
      expect(element.isolateScope().item.category_count.scheduled).toEqual({ count: 14, overdue: 12 });
      expect(element.isolateScope().item.category_count.incomplete.task).toBe(2);
    });
    /* TODO - Rest of function needs to be unit tested */
  });

  describe('isCurrentRelatedCaseVisible()', function () {
    var returnValue;

    beforeEach(function () {
      compileDirective();
      element.isolateScope().item = {};
      element.isolateScope().item.relatedCases = CasesData.values[0];
      element.isolateScope().relatedCasesPager.num = 2;
      element.isolateScope().relatedCasesPager.size = 5;
    });

    describe('when the index is between current range', function () {
      beforeEach(function () {
        returnValue = element.isolateScope().isCurrentRelatedCaseVisible(7);
      });

      it('shows the related case', function () {
        expect(returnValue).toBe(true);
      });
    });

    describe('when the index is more that the current range', function () {
      beforeEach(function () {
        returnValue = element.isolateScope().isCurrentRelatedCaseVisible(11);
      });

      it('hides the related case', function () {
        expect(returnValue).toBe(false);
      });
    });

    describe('when the index is less that the current range', function () {
      beforeEach(function () {
        returnValue = element.isolateScope().isCurrentRelatedCaseVisible(4);
      });

      it('hides the related case', function () {
        expect(returnValue).toBe(false);
      });
    });
  });

  function compileDirective () {
    $scope.viewingCaseDetails = CasesData.values[0];
    element = $compile('<div civicase-case-details="viewingCaseDetails"></div>')($scope);
    $scope.$digest();
  }
});
