/* eslint-env jasmine */

(function (_) {
  describe('CaseOverview', function () {
    var element, $q, $scope, $rootScope, $compile, CasesOverviewStats, crmApi, elResponse;

    beforeEach(module('civicase', 'civicase.data', 'civicase.templates'));

    beforeEach(inject(function (_$compile_, _$q_, _$rootScope_, _crmApi_, _CasesOverviewStatsData_) {
      $compile = _$compile_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      crmApi = _crmApi_;
      CasesOverviewStats = _CasesOverviewStatsData_.get();

      crmApi.and.returnValue($q.resolve([CasesOverviewStats]));
    }));

    beforeEach(function () {
      $scope.caseStatuses = CRM.civicase.caseStatuses;
      $scope.caseTypes = CRM.civicase.caseTypes;
      $scope.caseTypesLength = _.size(CRM.civicase.caseTypes);
      $scope.summaryData = [];
    });

    beforeEach(function () {
      listenForCaseOverviewRecalculate();
      compileDirective();
    });

    describe('compile directive', function () {
      it('should have class civicase__case-overview-container', function () {
        expect(element.html()).toContain('civicase__case-overview-container');
      });
    });

    describe('caseListLink', function () {
      it('checks the output of caseListLink function', function () {
        expect(element.isolateScope().caseListLink('type', 'status')).toEqual('#/case/list?cf=%7B%22case_type_id%22%3A%5B%22type%22%5D%2C%22status_id%22%3A%5B%22status%22%5D%7D');
      });
    });

    describe('when showBreakdown is false', function () {
      beforeEach(function () {
        element.isolateScope().showBreakdown = false;
      });
      describe('when showHideBreakdown is called', function () {
        beforeEach(function () {
          element.isolateScope().showHideBreakdown();
        });

        it('resets showBreakdown to true', function () {
          expect(element.isolateScope().showBreakdown).toBe(true);
        });
      });
    });

    describe('when showBreakdown is true', function () {
      beforeEach(function () {
        element.isolateScope().showBreakdown = true;
      });
      describe('when showHideBreakdown is called', function () {
        beforeEach(function () {
          element.isolateScope().showHideBreakdown();
        });

        it('resets showBreakdown to false', function () {
          expect(element.isolateScope().showBreakdown).toBe(false);
        });
      });
    });

    describe('showBreakdown watcher', function () {
      it('emit called and elResponse to be defined', function () {
        expect(elResponse).toEqual(element.find('[civicase-custom-scrollbar]')[0]);
      });
    });

    /**
     * Initialise directive
     */
    function compileDirective () {
      element = $compile('<civicase-case-overview></civicase-case-overview>')($scope);
      $scope.$digest();
    }

    /**
    * Listen for `civicase::custom-scrollbar::recalculate` event
    */
    function listenForCaseOverviewRecalculate () {
      $rootScope.$on('civicase::custom-scrollbar::recalculate', function (event, el) {
        elResponse = el;
      });
    }
  });
})(CRM._);
