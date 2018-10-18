/* eslint-env jasmine */
(function ($, _) {
  describe('ContactCaseList', function () {
    var $compile, $scope, $rootScope, $q, element, crmApi, res, eventResponse, CasesData, formatCase;

    beforeEach(module('civicase', 'civicase.templates', 'civicase.data'));

    beforeEach(inject(function (_$q_, _$compile_, _$rootScope_, _crmApi_, _CasesData_, _formatCase_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $q = _$q_;
      crmApi = _crmApi_;
      CasesData = _CasesData_.get();
      formatCase = _formatCase_;
    }));

    beforeEach(function () {
      res = {
        'cases': CasesData,
        'count': 10
      };

      crmApi.and.returnValue($q.resolve(res));
    });

    describe('basic tests', function () {
      beforeEach(function () {
        listenForContactCasesListLoadedEvent();
        compileDirective();
      });

      it('complies the ContactCaseList directive', function () {
        expect(element.html()).toContain('<!-- ngRepeat: case in cases -->');
      });

      it('loads cases', function () {
        expect(element.isolateScope().cases).toEqual(mockFormatCases(CasesData.values, 'Opened'));
      });

      it('loaded to be true', function () {
        expect(element.isolateScope().loaded).toBe(true);
      });

      it('page to be correct', function () {
        expect(element.isolateScope().page).toEqual({size: 3, num: 2});
      });

      it('should not have contact_role key', function () {
        expect(element.isolateScope().cases[0].contact_role).toBeUndefined();
      });

      it('checks for event response', function () {
        expect(eventResponse).toEqual({
          items: mockFormatCases(CasesData.values, 'Opened'),
          type: 'Opened',
          num: 1
        });
      });
    });

    describe('isLoadMoreAvailable', function () {
      describe('when cases count is equal to response count', function () {
        beforeEach(function () {
          res = {
            'cases': CasesData,
            'count': CasesData.values.length
          };

          crmApi.and.returnValue($q.resolve(res));
        });

        beforeEach(function () {
          compileDirective();
        });

        it('the isLoadMoreAvailable should be true', function () {
          expect(element.isolateScope().isLoadMoreAvailable).toBe(false);
        });
      });

      describe('when cases count is greater than response count', function () {
        beforeEach(function () {
          res = {
            'cases': CasesData,
            'count': CasesData.values.length + 1
          };

          crmApi.and.returnValue($q.resolve(res));
        });

        beforeEach(function () {
          compileDirective();
        });

        it('the isLoadMoreAvailable should be true', function () {
          expect(element.isolateScope().isLoadMoreAvailable).toBe(true);
        });
      });
    });

    describe('related Cases', function () {
      beforeEach(function () {
        listenForContactCasesListLoadedEvent();
        compileDirective('Related');
      });

      it('should have contact_role key', function () {
        expect(element.isolateScope().cases[0].contact_role).not.toBeUndefined();
      });

      it('checks for event response', function () {
        expect(eventResponse).toEqual({
          items: mockFormatCases(CasesData.values, 'Related'),
          type: 'Related',
          num: 1
        });
      });
    });

    /**
     * Compiles the directive
     */
    function compileDirective (type) {
      $scope.type = type || 'Opened';
      element = $compile('<civicase-contact-case-list case-type="type" pager-size="3"></civicase-contact-case-list>')($scope);
      $scope.$digest();
    }

    /**
     * Listener for `civicase::contact-record-case::cases-loaded` event
     */
    function listenForContactCasesListLoadedEvent () {
      $rootScope.$on('civicase::contact-record-case::cases-loaded', function (event, items, type, num) {
        eventResponse = {
          items: items,
          type: type,
          num: num
        };
      });
    }

    /**
     * Mock formatting of cases in ContactCaseList.js
     *
     * @params {Array} items
     * @params {String} type
     */
    function mockFormatCases (items, type) {
      _.each(items, function (item, ind) {
        if (type === 'Related') {
          items[ind].contact_role = 'Some role';
        }
      });

      return _.each(items, formatCase);
    }
  });
}(CRM.$, CRM._));
