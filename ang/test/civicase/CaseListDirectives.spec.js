/* eslint-env jasmine */

describe('CaseListDirective', function () {
  describe('stickyTableHeader directive', function () {
    var element, $compile, $rootScope, scope, affixReturnValue, affixOriginalFunction;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      scope = $rootScope.$new();
    }));

    beforeEach(function () {
      element = $compile(angular.element('<div sticky-table-header> <table><thead><th>Sample title</th><th>Sample title</th></thead></table></div>'))(scope);
    });

    beforeEach(function () {
      affixOriginalFunction = CRM.$.fn.affix;
      CRM.$.fn.affix = jasmine.createSpy('affix');
      affixReturnValue = jasmine.createSpyObj('affix', ['on']);
      CRM.$.fn.affix.and.returnValue(affixReturnValue);
    });

    afterEach(function () {
      CRM.$.fn.affix = affixOriginalFunction;
    });

    describe('if loading is not complete', function () {
      beforeEach(function () {
        scope.isLoading = true;
        scope.$digest();
      });

      it('does not add min-width style to the table elements', function () {
        expect(element.find('thead').html()).not.toContain('style="min-width');
      });

      it('does not makes the header sticky', function () {
        expect(CRM.$.fn.affix).not.toHaveBeenCalledWith(jasmine.objectContaining({offset: {top: jasmine.any(Number)}}));
      });

      it('does not binds the scroll position of table content to the table header', function () {
        expect(affixReturnValue.on).not.toHaveBeenCalledWith('affixed.bs.affix', jasmine.any(Function));
      });
    });

    describe('if loading is complete', function () {
      beforeEach(inject(function ($timeout) {
        scope.isLoading = false;
        scope.$digest();
        $timeout.flush(); // Flushing any timeouts used.
      }));

      it('adds min-width style to the table elements', function () {
        expect(element.find('thead').html()).toContain('style="min-width');
      });

      it('makes the header sticky', function () {
        expect(CRM.$.fn.affix).toHaveBeenCalledWith(jasmine.objectContaining({offset: {top: jasmine.any(Number)}}));
      });

      it('binds the scroll position of table content to the table header', function () {
        expect(affixReturnValue.on).toHaveBeenCalledWith('affixed.bs.affix', jasmine.any(Function));
      });
    });
  });

  describe('stickyFooterPager directive', function () {
    var element, $compile, $timeout, $rootScope, scope, offsetOriginalFunction, scrollTopOriginalFunction;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      scope = $rootScope.$new();
      $timeout = _$timeout_;
    }));

    beforeEach(function () {
      offsetOriginalFunction = CRM.$.fn.offset;
      scrollTopOriginalFunction = CRM.$.fn.scrollTop;
    });

    beforeEach(function () {
      // Creating a custom function to mock offset() jQuery function
      CRM.$.fn.offset = function () {
        return { top: 1000 };
      };
      element = $compile(angular.element('<div class="parent"><div class="content"></div><div class="civicase__pager" sticky-footer-pager>Pager</div></div>'))(scope);
      // Setting up the height of the page be adding height to the content
      CRM.$(element).find('.content').height('1000px');
    });

    afterEach(function () {
      CRM.$.fn.offset = offsetOriginalFunction;
      CRM.$.fn.scrollTop = scrollTopOriginalFunction;
    });

    describe('if loading is not complete', function () {
      describe('when pager is not in view', function () {
        beforeEach(function () {
          setupCommonSteps(true, scope, 0);
        });

        it('should not fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(false);
        });
      });

      describe('when pager is in view', function () {
        beforeEach(function () {
          setupCommonSteps(true, scope, 1200);
        });

        it('should not fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(false);
        });
      });
    });

    describe('if loading is complete', function () {
      describe('when pager is not in view', function () {
        beforeEach(function () {
          setupCommonSteps(false, scope, 0);
        });

        it('should fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(true);
        });
      });

      describe('when pager is in view', function () {
        beforeEach(function () {
          setupCommonSteps(false, scope, 1200);
        });

        it('should not fix the pager to the footer', function () {
          expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(false);
        });
      });
    });

    /**
     * Common setup for tests
     *
     * @params {boolean} loading - wheather loading is complete
     * @params {Object} scope
     * @params {Number} top - px from top the screen should scroll to.
     */
    function setupCommonSteps (loading, scope, top) {
      scope.isLoading = loading;
      // Creating a custom function to mock offset() jQuery function
      CRM.$.fn.scrollTop = function () {
        return top;
      };

      scope.$digest();

      if (!loading) {
        $timeout.flush(); // Flushing any timeouts used.
      }
    }
  });
});
