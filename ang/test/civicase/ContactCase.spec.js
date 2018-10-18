/* eslint-env jasmine */
(function ($) {
  describe('ContactCase', function () {
    var $compile, $scope, $rootScope, $q, element, originalEmitFunction, crmApi, res;

    beforeEach(module('civicase', 'civicase.templates'));

    beforeEach(inject(function (_$q_, _$compile_, _$rootScope_, _crmApi_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $q = _$q_;
      crmApi = _crmApi_;
    }));

    beforeEach(function () {
      res = [{
        'values': ['0', '1']
      }];

      crmApi.and.returnValue($q.resolve(res));
    });

    beforeEach(function () {
      compileDirective();
    });

    beforeEach(function () {
      originalEmitFunction = element.isolateScope().$emit;
      element.isolateScope().$emit = jasmine.createSpy('$emit');
    });

    afterEach(function () {
      element.isolateScope().$emit = originalEmitFunction;
    });

    describe('basic tests', function () {
      it('complies the ContactCase directive', function () {
        expect(element.html()).toContain('civicase__contact-cases');
      });

      it('calculates totalCount', function () {
        expect(element.isolateScope().totalResults).toBe(res[0]);
      });

      it('calls crmApi function', function () {
        expect(crmApi).toHaveBeenCalledWith([['Case', 'getcount', Object({contact_id: jasmine.any(Number)})]]);
      });
    });

    describe('refresh()', function () {
      beforeEach(function () {
        element.isolateScope().refresh();
      });

      it('should emit "civicase::contact-record-case::refresh-cases"', function () {
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('civicase::contact-record-case::refresh-cases');
      });
    });

    /**
     * Compiles the directive
     */
    function compileDirective () {
      element = $compile('<civicase-contact-case></civicase-contact-case>')($scope);
      $scope.$digest();
    }
  });
}(CRM.$));
