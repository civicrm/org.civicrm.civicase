/* eslint-env jasmine */
(function ($) {
  describe('civicaseSearch', function () {
    var element, $compile, $rootScope, $scope, $timeout, event, CaseFilters, affixOriginalFunction, offsetOriginalFunction, originalDoSearch, orginalParentScope, affixReturnValue;

    beforeEach(module('civicase.templates', 'civicase', 'civicase.data'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _CaseFilters_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $timeout = _$timeout_;
      CaseFilters = _CaseFilters_;
    }));

    beforeEach(function () {
      affixOriginalFunction = CRM.$.fn.affix;
      offsetOriginalFunction = CRM.$.fn.offset;
    });

    beforeEach(function () {
      CRM.$.fn.offset = function () {
        return { top: 100 };
      };
    });

    beforeEach(function () {
      CRM.$.fn.affix = jasmine.createSpy('affix');
      affixReturnValue = jasmine.createSpyObj('affix', ['on']);
      affixReturnValue.on.and.returnValue(affixReturnValue);
      CRM.$.fn.affix.and.returnValue(affixReturnValue);
    });

    beforeEach(function () {
      compileDirective();
    });

    afterEach(function () {
      CRM.$.fn.affix = affixOriginalFunction;
      CRM.$.fn.affix = offsetOriginalFunction;
    });

    describe('basic test', function () {
      it('complies civicaseSearch directive', function () {
        expect(element.hasClass('civicase__case-filter-panel')).toBe(true);
      });
    });

    describe('$scope variables', function () {
      it('checks $scope.caseTypeOptions', function () {
        expect(element.isolateScope().caseTypeOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.caseStatusOptions', function () {
        expect(element.isolateScope().caseStatusOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.customGroups', function () {
        expect(element.isolateScope().customGroups).toEqual(jasmine.any(Object));
      });

      it('checks $scope.caseRelationshipOptions', function () {
        expect(element.isolateScope().caseRelationshipOptions).toEqual(jasmine.any(Object));
      });

      it('checks $scope.checkPerm', function () {
        expect(element.isolateScope().checkPerm).toEqual(jasmine.any(Function));
      });

      it('checks $scope.filterDescription', function () {
        expect(element.isolateScope().filterDescription).toEqual(jasmine.any(Array));
      });

      it('checks $scope.filters', function () {
        expect(element.isolateScope().filterDescription).toEqual(jasmine.any(Object));
      });
    });

    describe('watchers', function () {
      describe('$scope.expanded', function () {
        beforeEach(function () {
          $scope.expanded = false;
          $scope.$digest();
          $timeout.flush(); // Flushing any timeouts used.
        });

        it('calls $affix function', function () {
          expect(CRM.$.fn.affix).toHaveBeenCalledWith(jasmine.objectContaining({offset: {top: jasmine.any(Number)}}));
        });
      });

      describe('$scope.relationshipType', function () {
        describe('I am the case manager', function () {
          beforeEach(function () {
            element.isolateScope().relationshipType = ['is_case_manager'];
            $scope.$digest();
          });

          it('update  $scope.filters.case_manager', function () {
            expect(element.isolateScope().filters.case_manager).toEqual([203]);
          });
        });
        describe('I am involved in the case', function () {
          beforeEach(function () {
            element.isolateScope().relationshipType = ['is_involved'];
            $scope.$digest();
          });

          it('update  $scope.filters.contact_id', function () {
            expect(element.isolateScope().filters.contact_id).toEqual([203]);
          });
        });
      });

      describe('$scope.filters', function () {
        beforeEach(function () {
          originalDoSearch = element.isolateScope().doSearch;
          element.isolateScope().doSearch = jasmine.createSpy('doSearch');
          element.isolateScope().filters = CaseFilters.filter;
        });

        afterEach(function () {
          element.isolateScope().doSearch = originalDoSearch;
        });

        describe('when $scope.expanded is false', function () {
          beforeEach(function () {
            element.isolateScope().expanded = false;
            $scope.$digest();
          });
          it('calls $scope.doSearch()', function () {
            expect(element.isolateScope().doSearch).toHaveBeenCalled();
          });
        });
        describe('when $scope.expanded is true', function () {
          beforeEach(function () {
            element.isolateScope().expanded = true;
            $scope.$digest();
          });
          it('does not calls $scope.doSearch()', function () {
            expect(element.isolateScope().doSearch).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('toggleIsDeleted($event)', function () {
      describe('when is_deleted is true', function () {
        beforeEach(function () {
          element.isolateScope().filters.is_deleted = true;
        });

        describe('click event triggered', function () {
          beforeEach(function () {
            event = $.Event('click');
            spyOn(event, 'preventDefault');
            element.find('.civicase__checkbox').trigger(event);
          });

          it('hides the checkbox', function () {
            expect(element.find('.civicase__checkbox').find('.civicase__checkbox--checked').length).toBe(0);
          });

          it('event.preventDefault to be called', function () {
            expect(event.preventDefault).toHaveBeenCalled();
          });
        });

        describe('Enter button is pressed', function () {
          beforeEach(function () {
            event = $.Event('keydown', {keyCode: 13});
            spyOn(event, 'preventDefault');
            element.find('.civicase__checkbox').trigger(event);
          });

          it('hides the checkbox', function () {
            expect(element.find('.civicase__checkbox').find('.civicase__checkbox--checked').length).toBe(0);
          });

          it('event.preventDefault to be called', function () {
            expect(event.preventDefault).toHaveBeenCalled();
          });
        });

        describe('Space button is pressed', function () {
          beforeEach(function () {
            event = $.Event('keydown', {keyCode: 32});
            spyOn(event, 'preventDefault');
            element.find('.civicase__checkbox').trigger(event);
          });

          it('hides the checkbox', function () {
            expect(element.find('.civicase__checkbox').find('.civicase__checkbox--checked').length).toBe(0);
          });

          it('event.preventDefault to be called', function () {
            expect(event.preventDefault).toHaveBeenCalled();
          });
        });
      });

      describe('when is_deleted is false', function () {
        beforeEach(function () {
          element.isolateScope().filters.is_deleted = false;
        });

        describe('click event triggered', function () {
          beforeEach(function () {
            event = $.Event('click');
            spyOn(event, 'preventDefault');
            element.find('.civicase__checkbox').trigger(event);
          });

          it('shows the checkbox', function () {
            expect(element.find('.civicase__checkbox').find('.civicase__checkbox--checked').length).toBe(1);
          });

          it('event.preventDefault to be called', function () {
            expect(event.preventDefault).toHaveBeenCalled();
          });
        });

        describe('Enter button is pressed', function () {
          beforeEach(function () {
            event = $.Event('keydown', {keyCode: 13});
            spyOn(event, 'preventDefault');
            element.find('.civicase__checkbox').trigger(event);
          });

          it('shows the checkbox', function () {
            expect(element.find('.civicase__checkbox').find('.civicase__checkbox--checked').length).toBe(1);
          });

          it('event.preventDefault to be called', function () {
            expect(event.preventDefault).toHaveBeenCalled();
          });
        });

        describe('Space button is pressed', function () {
          beforeEach(function () {
            event = $.Event('keydown', {keyCode: 32});
            spyOn(event, 'preventDefault');
            element.find('.civicase__checkbox').trigger(event);
          });

          it('shows the checkbox', function () {
            expect(element.find('.civicase__checkbox').find('.civicase__checkbox--checked').length).toBe(1);
          });

          it('event.preventDefault to be called', function () {
            expect(event.preventDefault).toHaveBeenCalled();
          });
        });
      });
    });

    describe('isEnabled(field)', function () {
      describe('when hiddenFilters are enabled', function () {
        it('should return false', function () {
          expect(element.isolateScope().isEnabled('hiddenfilter1')).toBe(false);
        });

        it('should return true', function () {
          expect(element.isolateScope().isEnabled('hiddenfilter3')).toBe(true);
        });
      });

      describe('when no hiddenfilters', function () {
        beforeEach(function () {
          element.isolateScope().hiddenFilters = undefined;
        });

        afterEach(function () {
          element.isolateScope().hiddenFilters = CaseFilters.hiddenFilters;
        });

        it('should return true', function () {
          expect(element.isolateScope().isEnabled('hiddenfilter1')).toBe(true);
        });

        it('should return true', function () {
          expect(element.isolateScope().isEnabled('hiddenfilter3')).toBe(true);
        });
      });
    });

    describe('caseManagerIsMe()', function () {
      describe('when case_manager is me', function () {
        beforeEach(function () {
          element.isolateScope().filters.case_manager = [203];
        });

        it('should return true', function () {
          expect(element.isolateScope().caseManagerIsMe()).toBe(true);
        });
      });

      describe('when case_manager is not me', function () {
        describe('when case id is different', function () {
          beforeEach(function () {
            element.isolateScope().filters.case_manager = [201];
          });

          it('should return false', function () {
            expect(element.isolateScope().caseManagerIsMe()).toBe(false);
          });
        });

        describe('when case id undefined', function () {
          beforeEach(function () {
            element.isolateScope().filters.case_manager = undefined;
          });

          it('should return undefined', function () {
            expect(element.isolateScope().caseManagerIsMe()).toBeUndefined();
          });
        });
      });
    });

    describe('doSearch()', function () {
      beforeEach(function () {
        orginalParentScope = element.isolateScope().$parent;
        element.isolateScope().$parent = {};
        element.isolateScope().$parent.$eval = jasmine.createSpy('eval');
      });

      beforeEach(function () {
        element.isolateScope().expanded = true;
        element.isolateScope().filters.contact_id = [203];
        element.isolateScope().doSearch();
      });

      afterEach(function () {
        element.isolateScope().$parent = orginalParentScope;
      });

      it('should build filter description', function () {
        expect(element.isolateScope().filterDescription).toEqual([ { label: 'Case Client', text: '1 selected' } ]);
      });

      it('should close the dropdown', function () {
        expect(element.isolateScope().expanded).toBe(false);
      });

      it('should call $eval', function () {
        expect(element.isolateScope().$parent.$eval).toHaveBeenCalledWith('applyAdvSearch(selectedFilters)', jasmine.objectContaining({selectedFilters: jasmine.any(Object)}));
      });
    });

    describe('clearSearch()', function () {
      beforeEach(function () {
        originalDoSearch = element.isolateScope().doSearch;
        element.isolateScope().doSearch = jasmine.createSpy('doSearch');
        element.isolateScope().filters = CaseFilters.filter;
        element.isolateScope().clearSearch();
      });

      afterEach(function () {
        element.isolateScope().doSearch = originalDoSearch;
      });

      it('clears filters object', function () {
        expect(element.isolateScope().filters).toEqual({});
      });

      it('calls doSearch()', function () {
        expect(element.isolateScope().doSearch).toHaveBeenCalled();
      });
    });

    describe('mapSelectOptions()', function () {
      it('returns a mapped response', function () {
        expect(element.isolateScope().caseTypeOptions[0]).toEqual(jasmine.objectContaining({id: jasmine.any(String), text: jasmine.any(String), color: jasmine.any(String), icon: jasmine.any(String)}));
      });
    });

    /**
     * Function responsible for setting up compilation of the directive
     * @param {Object} Case card object
     */
    function compileDirective () {
      $scope.filters = {};
      $scope.hiddenFilters = CaseFilters.hiddenFilters;
      $scope.searchIsOpentrue = true;
      $scope.applyAdvSearch = function () { };
      element = $compile('<civicase-search filters="filters" hidden-filters="hiddenFilters" expanded="searchIsOpen" on-search="applyAdvSearch(selectedFilters)"></civicase-search>')($scope);
      $scope.$digest();
    }
  });
}(CRM.$));
