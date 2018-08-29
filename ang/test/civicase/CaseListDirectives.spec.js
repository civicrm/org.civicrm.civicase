/* eslint-env jasmine */

describe('CaseListDirective', function () {
  var $compile, $rootScope, scope;

  // Inject civicase module to use its components
  beforeEach(module('civicase'));

  /**
   * Inject compile and rootscope dependency.
   * Runs before each Directive test case
   */
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
  }));

  describe('stickyTableHeader Directive', function () {
    var element;
    beforeEach(function () {
      element = $compile(angular.element('<div sticky-table-header> <table><thead><th>Sample title</th><th>Sample title</th></thead></table></div>'))(scope);
    });

    describe('Only add logic if loading is complete', function () {
      beforeEach(function () {
        scope.isLoading = true;
        scope.$digest();
      });

      it('adds min-width style to the table elements', function () {
        expect(element.find('thead').html()).not.toContain('style="min-width');
      });
    });

    describe('Add min-width to table elements', function () {
      beforeEach(inject(function ($timeout) {
        scope.isLoading = false;
        scope.$digest();
        $timeout.flush(); // Flusing any timeouts used.
      }));

      it('adds min-width style to the table elements', function () {
        expect(element.find('thead').html()).toContain('style="min-width');
      });
    });
  });

  describe('stickyFooterPager Directive', function () {
    var element;

    beforeEach(function () {
      // Creating a custom function to mock offset() jQuery function
      CRM.$.fn.offset = function () {
        return { top: 1000 };
      };
      element = $compile(angular.element('<div class="parent"><div class="content"></div><div class="civicase__pager" sticky-footer-pager>Pager</div></div>'))(scope);
      // Setting up the height of the page be adding height to the content
      CRM.$(element).find('.content').height('1000px');
      // Flagging load complete event to trigger directive.
      scope.isLoading = false;
    });

    describe('footer adds class fixed when pager is in not view', function () {
      beforeEach(inject(function ($window) {
        scope.$digest();
      }));

      it('should add class for fix styling', function () {
        expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(true);
      });
    });

    describe('footer do not add class fixed when pager is in view', function () {
      beforeEach(inject(function ($window) {
        CRM.$.fn.scrollTop = function () {
          return {top: 1200};
        };

        scope.$digest();
      }));

      it('should not add class for fix styling', function () {
        expect(element.find('.civicase__pager').hasClass('civicase__pager--fixed')).toBe(false);
      });
    });
  });
});
