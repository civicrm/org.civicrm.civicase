/* eslint-env jasmine */

describe('civicaseActivityMonthNavAffix', function () {
  var element, $compile, $document, $rootScope, $timeout, scope;

  beforeEach(module('civicase'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$document_, _$timeout_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    $document = _$document_;
    $timeout = _$timeout_;
  }));

  beforeEach(function () {
    compileDirective();
  });

  beforeEach(function () {
    spyOn(CRM.$.fn, 'affix').and.callThrough();
  });

  afterEach(function () {
    removeTestDomElements();
  });

  describe('when initialised', function () {
    var $activityMonthNav, $filter, $feedListContainer, $tabs, $toolbarDrawer;

    beforeEach(function () {
      $filter = CRM.$('.civicase__activity-filter');
      $feedListContainer = CRM.$('.civicase__activity-feed__body');
      $tabs = CRM.$('.civicase__dashboard').length > 0
        ? CRM.$('.civicase__dashboard__tab-container ul.nav')
        : CRM.$('.civicase__case-body_tab');
      $toolbarDrawer = CRM.$('#toolbar');

      compileDirective();

      $activityMonthNav = element.find('.civicase__activity-month-nav');
    });

    afterEach(function () {
      removeTestDomElements();
    });

    it('does not affix before activity feed completes loading', function () {
      expect(element.find('.civicase__activity-month-nav').affix).not.toHaveBeenCalled();
    });

    describe('after activity feed completes loading', function () {
      beforeEach(function () {
        scope.isLoading = false;
        scope.$digest();
        $timeout.flush();
      });

      it('applies static positioning to the activity month nav', function () {
        expect(element.find('.civicase__activity-month-nav').affix).toHaveBeenCalledWith({
          offset: {
            top: $activityMonthNav.offset().top - ($toolbarDrawer.height() + $tabs.height() + $filter.outerHeight()),
            bottom: CRM.$($document).height() - ($feedListContainer.offset().top + $feedListContainer.height())
          }
        });
      });
    });
  });

  describe('when static positioning is applied to the Activity Month Nav', function () {
    var $activityMonthNav, $filter, $tabs, $toolbarDrawer;

    beforeEach(function () {
      $activityMonthNav = element.find('.civicase__activity-month-nav');
      $filter = CRM.$('.civicase__activity-filter');
      $tabs = CRM.$('.civicase__dashboard').length > 0
        ? CRM.$('.civicase__dashboard__tab-container ul.nav')
        : CRM.$('.civicase__case-body_tab');
      $toolbarDrawer = CRM.$('#toolbar');

      scope.isLoading = false;
      scope.$digest();
      $timeout.flush();

      $activityMonthNav.trigger('affixed.bs.affix');
    });

    it('sets the top positioning', function () {
      expect($activityMonthNav.css('top')).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()) + 'px');
    });
  });

  describe('when static positioning is removed to the Activity Month Nav', function () {
    var $activityMonthNav;

    beforeEach(function () {
      $activityMonthNav = element.find('.civicase__activity-month-nav');

      scope.isLoading = false;
      scope.$digest();
      $timeout.flush();

      $activityMonthNav.trigger('affixed-top.bs.affix');
    });

    it('resets the top positioning', function () {
      expect($activityMonthNav.css('top')).toBe('auto');
    });
  });

  describe('event handlers', function () {
    var $activityMonthNav, $filter, $tabs, $toolbarDrawer;

    beforeEach(function () {
      $activityMonthNav = element.find('.civicase__activity-month-nav');
      $filter = CRM.$('.civicase__activity-filter');
      $tabs = CRM.$('.civicase__dashboard').length > 0
        ? CRM.$('.civicase__dashboard__tab-container ul.nav')
        : CRM.$('.civicase__case-body_tab');
      $toolbarDrawer = CRM.$('#toolbar');

      scope.isLoading = false;
      scope.$digest();
      $timeout.flush();
    });

    describe('when more filters has been toggled', function () {
      beforeEach(function () {
        $rootScope.$broadcast('civicase::activity-filters::more-filters-toggled');
        $timeout.flush();
      });

      it('resets the top positioning', function () {
        expect($activityMonthNav.data('bs.affix').options.offset.top).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()));
      });
    });

    describe('when activity feed parameters has changed', function () {
      beforeEach(function () {
        $rootScope.$broadcast('civicaseActivityFeed.query');
        $timeout.flush();
      });

      it('resets the top positioning', function () {
        expect($activityMonthNav.data('bs.affix').options.offset.top).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()));
      });
    });

    describe('when case search dropdown has been toggled', function () {
      beforeEach(function () {
        $rootScope.$broadcast('civicase::case-search::dropdown-toggle');
        $timeout.flush();
      });

      it('resets the top positioning', function () {
        expect($activityMonthNav.data('bs.affix').options.offset.top).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()));
      });
    });
  });

  /**
   * Compiles the directive and appends test DOM elements to the body.
   */
  function compileDirective () {
    var activityMonthNav = angular.element(`
      <div civicase-activity-month-nav-affix>
        <div class="civicase__activity-month-nav">
        </div>
      </div>`);

    CRM.$('<div class="civicase__activity-feed__body"></div>').appendTo('body');
    CRM.$('<div class="civicase__activity-filter"></div>').appendTo('body');
    CRM.$('<div id="toolbar"></div>').appendTo('body');

    element = $compile(activityMonthNav)(scope);
  }

  /**
   * Removes DOM elements added for testing purposes.
   */
  function removeTestDomElements () {
    CRM.$('.civicase__activity-feed__body').remove();
    CRM.$('.civicase__activity-filter').remove();
    CRM.$('#toolbar').remove();
  }
});
