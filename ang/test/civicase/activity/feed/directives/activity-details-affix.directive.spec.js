/* eslint-env jasmine */

describe('civicaseActivityDetailsAffix', function () {
  var element, $compile, $document, $rootScope, $timeout, scope,
    affixReturnValue, affixOriginalFunction;

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
    affixOriginalFunction = CRM.$.fn.affix;
    CRM.$.fn.affix = jasmine.createSpy('affix');
    affixReturnValue = jasmine.createSpyObj('affix', ['on']);
    affixReturnValue.on.and.returnValue(affixReturnValue);
    CRM.$.fn.affix.and.returnValue(affixReturnValue);

    spyOn($rootScope, '$broadcast').and.callThrough();
  });

  afterEach(function () {
    CRM.$.fn.affix = affixOriginalFunction;

    removeTestDomElements();
  });

  describe('when initialised', function () {
    var $activityDetailsPanel, $filter, $feedListContainer, $tabs, $toolbarDrawer;

    beforeEach(function () {
      $filter = CRM.$('.civicase__activity-filter');
      $feedListContainer = CRM.$('.civicase__activity-feed__body');
      $tabs = CRM.$('.civicase__dashboard').length > 0 ? CRM.$('.civicase__dashboard__tab-container ul.nav') : CRM.$('.civicase__case-body_tab');
      $toolbarDrawer = CRM.$('#toolbar');

      compileDirective();
      $timeout.flush();
      $activityDetailsPanel = element.find('.civicase__activity-panel');
    });

    afterEach(function () {
      removeTestDomElements();
    });

    it('fires an event to notify activity details initialisation', function () {
      expect($rootScope.$broadcast)
        .toHaveBeenCalledWith('civicase::activity-details::initialised');
    });

    it('applies static positioning to the activity details', function () {
      expect(element.find('.civicase__activity-panel').affix).toHaveBeenCalledWith({
        offset: {
          top: $activityDetailsPanel.offset().top - ($toolbarDrawer.height() + $tabs.height() + $filter.outerHeight()),
          bottom: CRM.$($document).height() - ($feedListContainer.offset().top + $feedListContainer.height())
        }
      });
    });

    describe('when the activity details panel is initialised with window already scrolled', function () {
      beforeEach(function () {
        compileDirective({isAffixedOnInit: true});

        $activityDetailsPanel = element.find('.civicase__activity-panel');
      });

      afterEach(function () {
        removeTestDomElements();
      });

      it('sets the top positioning', function () {
        expect($activityDetailsPanel.css('top')).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()) + 'px');
      });

      it('sets the width of the activity details panel', function () {
        expect($activityDetailsPanel.width()).toBe(element.width());
      });
    });
  });

  describe('when static positioning is applied to the Activity Panel', function () {
    var $activityDetailsPanel, $filter, $tabs, $toolbarDrawer;

    beforeEach(function () {
      $activityDetailsPanel = element.find('.civicase__activity-panel');
      $filter = CRM.$('.civicase__activity-filter');
      $tabs = CRM.$('.civicase__dashboard').length > 0 ? CRM.$('.civicase__dashboard__tab-container ul.nav') : CRM.$('.civicase__case-body_tab');
      $toolbarDrawer = CRM.$('#toolbar');

      $activityDetailsPanel.trigger('affixed.bs.affix');
    });

    it('sets the top positioning', function () {
      expect($activityDetailsPanel.css('top')).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()) + 'px');
    });

    it('sets the width of the activity details panel', function () {
      expect($activityDetailsPanel.width()).toBe(element.width());
    });
  });

  describe('when static positioning is removed to the Activity Panel', function () {
    var $activityDetailsPanel;

    beforeEach(function () {
      $activityDetailsPanel = element.find('.civicase__activity-panel');

      $activityDetailsPanel.trigger('affixed-top.bs.affix');
    });

    it('resets the top positioning', function () {
      expect($activityDetailsPanel.css('top')).toBe('auto');
    });

    it('resets the width', function () {
      expect($activityDetailsPanel.width()).toBe(0);
    });
  });

  /**
   * Compiles the directive and appends test DOM elements to the body.
   *
   * @param {Object} options
   */
  function compileDirective (options) {
    options = options || {};
    var activityDetailsPanel = angular.element('<div civicase-activity-details-affix><div class="civicase__activity-panel"></div></div>');

    CRM.$('<div class="civicase__activity-feed__body"></div>').appendTo('body');
    CRM.$('<div class="civicase__activity-filter"></div>').appendTo('body');
    CRM.$('<div id="toolbar"></div>').appendTo('body');

    if (options.isAffixedOnInit) {
      activityDetailsPanel.find('.civicase__activity-panel').addClass('affix');
    }

    element = $compile(activityDetailsPanel)(scope);
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
