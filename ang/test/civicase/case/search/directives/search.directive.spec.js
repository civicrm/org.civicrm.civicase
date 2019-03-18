/* eslint-env jasmine */
(function ($) {
  describe('civicaseSearch', function () {
    var $controller, $rootScope, $scope, CaseFilters, crmApi, affixOriginalFunction,
      offsetOriginalFunction, originalDoSearch, orginalParentScope, affixReturnValue,
      originalBindToRoute;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data', function ($provide) {
      crmApi = jasmine.createSpy('crmApi');

      $provide.value('crmApi', crmApi);
    }));

    beforeEach(inject(function (_$controller_, $q, _$rootScope_, _CaseFilters_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      CaseFilters = _CaseFilters_;

      crmApi.and.returnValue($q.resolve({ values: [] }));
    }));

    beforeEach(function () {
      affixOriginalFunction = CRM.$.fn.affix;
      offsetOriginalFunction = CRM.$.fn.offset;

      CRM.$.fn.offset = function () {
        return { top: 100 };
      };

      CRM.$.fn.affix = jasmine.createSpy('affix');
      affixReturnValue = jasmine.createSpyObj('affix', ['on']);
      affixReturnValue.on.and.returnValue(affixReturnValue);
      CRM.$.fn.affix.and.returnValue(affixReturnValue);
      originalBindToRoute = $scope.$bindToRoute;
      $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');

      initController();
    });

    afterEach(function () {
      CRM.$.fn.affix = affixOriginalFunction;
      CRM.$.fn.offset = offsetOriginalFunction;
      $scope.$bindToRoute = originalBindToRoute;
    });

    describe('$scope variables', function () {
      it('checks $scope.caseTypeOptions', function () {
        expect($scope.caseTypeOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.caseStatusOptions', function () {
        expect($scope.caseStatusOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.customGroups', function () {
        expect($scope.customGroups).toEqual(jasmine.any(Object));
      });

      it('checks $scope.caseRelationshipOptions', function () {
        expect($scope.caseRelationshipOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.checkPerm', function () {
        expect($scope.checkPerm).toEqual(jasmine.any(Function));
      });

      it('checks $scope.filterDescription', function () {
        expect($scope.filterDescription).toEqual(jasmine.any(Array));
      });

      it('checks $scope.filters', function () {
        expect($scope.filterDescription).toEqual(jasmine.any(Object));
      });
    });

    describe('watchers', function () {
      describe('when updating the relationship types', function () {
        describe('when I am the case manager', function () {
          beforeEach(function () {
            $scope.relationshipType = ['is_case_manager'];
            $scope.$digest();
          });

          it('sets the case manager filter equal to my id', function () {
            expect($scope.filters.case_manager).toEqual([CRM.config.user_contact_id]);
          });
        });

        describe('when I am involved in the case', function () {
          beforeEach(function () {
            $scope.relationshipType = ['is_involved'];
            $scope.$digest();
          });

          it('sets the contact id filter equal to my id', function () {
            expect($scope.filters.contact_involved).toEqual([CRM.config.user_contact_id]);
          });
        });
      });

      describe('$scope.filters', function () {
        beforeEach(function () {
          originalDoSearch = $scope.doSearch;
          $scope.doSearch = jasmine.createSpy('doSearch');
          $scope.filters = CaseFilters.filter;
        });

        afterEach(function () {
          $scope.doSearch = originalDoSearch;
        });

        describe('when $scope.expanded is false', function () {
          beforeEach(function () {
            $scope.expanded = false;
            $scope.$digest();
          });
          it('calls $scope.doSearch()', function () {
            expect($scope.doSearch).toHaveBeenCalled();
          });
        });
        describe('when $scope.expanded is true', function () {
          beforeEach(function () {
            $scope.expanded = true;
            $scope.$digest();
          });
          it('does not calls $scope.doSearch()', function () {
            expect($scope.doSearch).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('caseManagerIsMe()', function () {
      describe('when case_manager is me', function () {
        beforeEach(function () {
          $scope.filters.case_manager = [203];
        });

        it('should return true', function () {
          expect($scope.caseManagerIsMe()).toBe(true);
        });
      });

      describe('when case_manager is not me', function () {
        describe('when case id is different', function () {
          beforeEach(function () {
            $scope.filters.case_manager = [201];
          });

          it('should return false', function () {
            expect($scope.caseManagerIsMe()).toBe(false);
          });
        });

        describe('when case id undefined', function () {
          beforeEach(function () {
            $scope.filters.case_manager = undefined;
          });

          it('should return undefined', function () {
            expect($scope.caseManagerIsMe()).toBeUndefined();
          });
        });
      });
    });

    describe('doSearch()', function () {
      beforeEach(function () {
        orginalParentScope = $scope.$parent;
        $scope.$parent = {};
      });

      beforeEach(function () {
        $scope.expanded = true;
        $scope.filters.case_manager = [203];
        $scope.doSearch();
      });

      afterEach(function () {
        $scope.$parent = orginalParentScope;
      });

      it('should build filter description', function () {
        expect($scope.filterDescription).toEqual([ { label: 'Case Manager', text: 'Me' } ]);
      });

      it('should close the dropdown', function () {
        expect($scope.expanded).toBe(false);
      });
    });

    describe('clearSearch()', function () {
      beforeEach(function () {
        originalDoSearch = $scope.doSearch;
        $scope.doSearch = jasmine.createSpy('doSearch');
        $scope.filters = CaseFilters.filter;
        $scope.clearSearch();
      });

      afterEach(function () {
        $scope.doSearch = originalDoSearch;
      });

      it('clears filters object', function () {
        expect($scope.filters).toEqual({});
      });

      it('calls doSearch()', function () {
        expect($scope.doSearch).toHaveBeenCalled();
      });
    });

    describe('mapSelectOptions()', function () {
      it('returns a mapped response', function () {
        expect($scope.caseTypeOptions[0]).toEqual(jasmine.objectContaining({id: jasmine.any(String), text: jasmine.any(String), color: jasmine.any(String), icon: jasmine.any(String)}));
      });
    });

    /**
     * Initiate controller
     */
    function initController () {
      $scope.filters = {};
      $scope.searchIsOpentrue = true;
      $scope.applyAdvSearch = function () { };
      $controller('civicaseSearchController', {
        $scope: $scope
      });
    }
  });
}(CRM.$));
