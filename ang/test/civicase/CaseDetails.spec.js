/* eslint-env jasmine */
(function (_) {
  describe('civicaseCaseDetails', function () {
    var element, controller, activitiesMockData, $controller, $compile, $rootScope, $scope, $provide, crmApi, crmApiMock, $q, formatCase, CasesData, CasesUtils;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data', function (_$provide_) {
      $provide = _$provide_;

      killDirective('civicaseActivitiesCalendar');
    }));

    beforeEach(inject(function ($q) {
      var formatCaseMock = jasmine.createSpy('formatCase');
      crmApiMock = jasmine.createSpy('crmApi').and.returnValue($q.resolve());

      formatCaseMock.and.callFake(function (data) {
        return data;
      });

      $provide.value('crmApi', crmApiMock);
      $provide.value('formatCase', formatCaseMock);
    }));

    beforeEach(inject(function (_$compile_, _$controller_, _$rootScope_, _activitiesMockData_, _CasesData_, _crmApi_, _$q_, _formatCase_, _CasesUtils_) {
      $compile = _$compile_;
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      activitiesMockData = _activitiesMockData_;
      CasesData = _CasesData_;
      CasesUtils = _CasesUtils_;
      $scope = $rootScope.$new();
      $q = _$q_;
      crmApi = _crmApi_;
      formatCase = _formatCase_;

      crmApi.and.returnValue($q.resolve(CasesData.get()));
      spyOn(CasesUtils, 'fetchMoreContactsInformation');
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
        element.isolateScope().item = CasesData.get().values[0];
        element.isolateScope().pushCaseData(CasesData.get().values[0]);
      });

      it('calculates the incomplete scheduled activities', function () {
        expect(element.isolateScope().item.category_count.scheduled).toEqual(getScheduledActivitiesCount(element.isolateScope().item.allActivities));
      });

      it('calculates the incomplete tasks activities', function () {
        expect(element.isolateScope().item.category_count.incomplete.task).toBe(2);
      });

      describe('Related Cases', function () {
        describe('related cases', function () {
          var relatedCasesByContact, linkedCases;

          beforeEach(function () {
            relatedCasesByContact = CasesData.get().values[0]['api.Case.getcaselist.relatedCasesByContact'].values;
            linkedCases = CasesData.get().values[0]['api.Case.getcaselist.linkedCases'].values;
          });

          it('related cases are displayed', function () {
            expect(element.isolateScope().item.relatedCases.length).toBe(relatedCasesByContact.concat(linkedCases).length);
          });
        });

        describe('linked cases cases', function () {
          var relatedCasesCopy, sortedList;

          beforeEach(function () {
            relatedCasesCopy = angular.copy(element.isolateScope().item.relatedCases);
            sortedList = relatedCasesCopy.sort(function (x, y) {
              return !!y.is_linked - !!x.is_linked;
            });
          });

          it('linked cases are displayed first', function () {
            expect(sortedList).toEqual(element.isolateScope().item.relatedCases);
          });
        });

        it('shows the first page of the pager', function () {
          expect(element.isolateScope().relatedCasesPager.num).toBe(1);
        });
      });
      /* TODO - Rest of function needs to be unit tested */
    });

    describe('isCurrentRelatedCaseVisible()', function () {
      var returnValue;

      beforeEach(function () {
        compileDirective();
        element.isolateScope().item = {};
        element.isolateScope().item.relatedCases = CasesData.get().values[0];
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

    describe('when printing selected activities', function () {
      var selectedActivities;

      beforeEach(function () {
        initController();

        controller.getPrintActivityUrl(activitiesMockData.get());
        selectedActivities = activitiesMockData.get().map(function (item) {
          return item['id'];
        }).join(',');
      });

      it('retuns the url to print the activities', function () {
        expect(CRM.url).toHaveBeenCalledWith('civicrm/case/customreport/print', {
          all: 1,
          redact: 0,
          cid: $scope.item.client[0].contact_id,
          asn: 'standard_timeline',
          caseID: $scope.item.id,
          sact: selectedActivities
        });
      });
    });

    function compileDirective () {
      $scope.viewingCaseDetails = formatCase(CasesData.get().values[0]);
      element = $compile('<div civicase-case-details="viewingCaseDetails"></div>')($scope);
      $scope.$digest();
    }

    /**
     * Initializes the case details controller.
     *
     * @param {Object} caseItem a case item to pass to the controller. Defaults to
     * a case from the mock data.
     */
    function initController (caseItem) {
      $scope = $rootScope.$new();

      controller = $controller('civicaseCaseDetailsController', {
        $scope: $scope
      });
      $scope.item = caseItem || _.cloneDeep(CasesData.get().values[0]);
      $scope.$digest();
    }

    /**
     * Gets object containing correct count of total and overdue scheduled activities
     *
     * @params {Array} activities - total activities
     * @return {Object} - with total count and overdue count
     */
    function getScheduledActivitiesCount (activities) {
      var scheduledActivities = _.filter(activities, function (act) {
        return CRM.civicase.activityStatusTypes.incomplete.indexOf(parseInt(act.status_id, 10)) > -1;
      });
      var overdueActivities = _.filter(scheduledActivities, function (act) {
        return moment().isAfter(act.activity_date_time);
      });

      return {
        count: scheduledActivities.length,
        overdue: overdueActivities.length
      };
    }

    /**
     * Mocks a directive
     * TODO: Have a more generic usage - Maybe create a service/factory
     *
     * @param {String} directiveName
     */
    function killDirective (directiveName) {
      angular.mock.module(function ($compileProvider) {
        $compileProvider.directive(directiveName, function () {
          return {
            priority: 9999999,
            terminal: true
          };
        });
      });
    }
  });

  describe('civicaseCaseDetailsController', function () {
    var $controller, $provide, $rootScope, $route, $scope, CasesData, crmApiMock;

    beforeEach(module('civicase', 'civicase.data', function (_$provide_) {
      $provide = _$provide_;
    }));

    beforeEach(inject(function (_$controller_, $q, _$rootScope_, _$route_, _CasesData_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $route = _$route_;
      CasesData = _CasesData_;
      crmApiMock = jasmine.createSpy('crmApi').and
        .returnValue($q.defer().promise);

      $provide.value('crmApi', crmApiMock);
    }));

    describe('viewing the case', function () {
      describe('when requesting to view a case that is missing its details', function () {
        beforeEach(function () {
          initController();
        });

        it('requests the missing case details', function () {
          expect(crmApiMock).toHaveBeenCalledWith(
            'Case', 'getdetails', jasmine.any(Object)
          );
        });
      });

      describe('when the case is locked for the current user', function () {
        beforeEach(function () {
          var caseItem = _.cloneDeep(CasesData.get().values[0]);
          caseItem.lock = 1;

          spyOn($route, 'updateParams');
          initController(caseItem);
        });

        it('redirects the user to the case list', function () {
          expect($route.updateParams).toHaveBeenCalledWith({ caseId: null });
        });
      });
    });

    /**
     * Initializes the case details controller.
     *
     * @param {Object} caseItem a case item to pass to the controller. Defaults to
     * a case from the mock data.
     */
    function initController (caseItem) {
      $scope = $rootScope.$new();

      $controller('civicaseCaseDetailsController', {
        $scope: $scope
      });
      $scope.item = caseItem || _.cloneDeep(CasesData.get().values[0]);
      $scope.$digest();
    }
  });
})(CRM._);
