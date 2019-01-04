/* eslint-env jasmine */
(function ($, _) {
  describe('CaseOverview', function () {
    var element, $q, $scope, $rootScope, $compile, BrowserCache,
      CasesOverviewStats, crmApi, targetElementScope;

    beforeEach(module('civicase', 'civicase.data', 'civicase.templates', function ($provide) {
      BrowserCache = jasmine.createSpyObj('BrowserCache', ['clear', 'get', 'set']);

      BrowserCache.get.and.returnValue([1, 3]);

      $provide.value('BrowserCache', BrowserCache);
    }));

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

    describe('Case Status', function () {
      describe('when the component loads', function () {
        it('requests the case status that are hidden stored in the browser cache', function () {
          expect(BrowserCache.get).toHaveBeenCalledWith('civicase.CaseOverview.hiddenCaseStatuses', []);
        });

        it('hides the case statuses marked as hidden by the browser cache', function () {
          expect($scope.caseStatuses[1].isHidden).toBe(true);
          expect($scope.caseStatuses[3].isHidden).toBe(true);
        });
      });

      describe('when marking a status as hidden', function () {
        beforeEach(function () {
          $scope.caseStatuses[1].isHidden = true;
          $scope.caseStatuses[2].isHidden = false;
          $scope.caseStatuses[3].isHidden = true;

          element.isolateScope().toggleStatusVisibility($.Event(), 1); // disables the case status #2
        });

        it('stores the hidden case statuses including the new one', function () {
          expect(BrowserCache.set).toHaveBeenCalledWith('civicase.CaseOverview.hiddenCaseStatuses', [ '1', '2', '3' ]);
        });
      });

      describe('when marking a status as enabled', function () {
        beforeEach(function () {
          $scope.caseStatuses[1].isHidden = true;
          $scope.caseStatuses[2].isHidden = false;
          $scope.caseStatuses[3].isHidden = true;

          element.isolateScope().toggleStatusVisibility($.Event(), 0); // enables the case status #1
        });

        it('stores the hidden case statuses including the new one', function () {
          expect(BrowserCache.set).toHaveBeenCalledWith('civicase.CaseOverview.hiddenCaseStatuses', [ '3' ]);
        });
      });
    });

    describe('when showBreakdown is false', function () {
      beforeEach(function () {
        element.isolateScope().showBreakdown = false;
      });

      describe('when toggleBrekdownVisibility is called', function () {
        beforeEach(function () {
          element.isolateScope().toggleBrekdownVisibility();
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

      describe('when toggleBrekdownVisibility is called', function () {
        beforeEach(function () {
          element.isolateScope().toggleBrekdownVisibility();
        });

        it('resets showBreakdown to false', function () {
          expect(element.isolateScope().showBreakdown).toBe(false);
        });
      });
    });

    describe('showBreakdown watcher', function () {
      it('emit called and targetElementScope to be defined', function () {
        expect(targetElementScope).toEqual(element.isolateScope());
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
      $rootScope.$on('civicase::custom-scrollbar::recalculate', function (event) {
        targetElementScope = event.targetScope;
      });
    }
  });
})(CRM.$, CRM._);
