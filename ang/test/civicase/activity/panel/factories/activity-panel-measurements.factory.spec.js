/* eslint-env jasmine */

(function ($) {
  describe('ActivityPanelMeasurements', function () {
    var $activityPanel, $document, $feedListContainer, activityPanelMeasurements,
      expectedResult, result, toolbarTabsFiltersHeight;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$document_, ActivityPanelMeasurements) {
      initMockActivityPanel();

      toolbarTabsFiltersHeight = 100 + 100 + 100; // toolbar + tabs + filter's height.
      $document = _$document_;
      activityPanelMeasurements = ActivityPanelMeasurements($activityPanel);
    }));

    afterEach(function () {
      $('.activity-panel-measurements-test').remove();
    });

    describe('getBottomOffset()', function () {
      beforeEach(function () {
        result = activityPanelMeasurements.getBottomOffset();
        expectedResult = $document.height() - ($feedListContainer.offset().top + $feedListContainer.height());
      });

      it('returns the bottom offset of the panel which is the same as the bottom offset of the feed list container', function () {
        expect(result).toBe(expectedResult);
      });
    });

    describe('getDistanceFromTop()', function () {
      beforeEach(function () {
        result = activityPanelMeasurements.getDistanceFromTop();
        expectedResult = 100 + 100 + 100; // toolbar + tabs + filter's height.
      });

      it('returns the panel distance from the top taking into consideration the toolbar, case tabs, and case filters height', function () {
        expect(result).toBe(expectedResult);
      });
    });

    describe('getPanelBodyTopOffset()', function () {
      beforeEach(function () {
        var headerSubHeaderActionsHeight = 100 + 100 + 100;

        result = activityPanelMeasurements.getPanelBodyTopOffset();
        expectedResult = toolbarTabsFiltersHeight + headerSubHeaderActionsHeight;
      });

      it('returns the bottom offset of the panel which is the same as the bottom offset of the feed list container', function () {
        expect(result).toBe(expectedResult);
      });
    });

    describe('getTopOffset()', function () {
      beforeEach(function () {
        result = activityPanelMeasurements.getTopOffset();
        expectedResult = $activityPanel.offset().top - toolbarTabsFiltersHeight;
      });

      it('returns the panel top offset taking into consideration the toolbar, case tabs, and case filters height', function () {
        expect(result).toBe(expectedResult);
      });
    });

    function initMockActivityPanel () {
      var html = `<div class="activity-panel-measurements-test">
        <div id="toolbar" style="height: 100px;">Toolbar</div>
        <div class="civicase__case-body_tab" style="height: 100px;">Case tabs</div>
        <div class="civicase__activity-filter" style="height: 100px;">Case filters</div>
        <div class="civicase__activity-feed__body" style="height: 600px;">
          Activity feed list container
        </div>
        <div class="activity-panel">
          <div class="panel-heading" style="height: 100px;">Panel heading</div>
          <div class="panel-subheading" style="height: 100px;">Panel subheading</div>
          <div class="panel-body" style="height: 200px;">Panel body</div>
          <div class="crm-submit-buttons" style="height: 100px;">Panel actions</div>
        </div>
      </div>`;

      $(html).appendTo('body');

      $activityPanel = $('.activity-panel');
      $feedListContainer = $('.civicase__activity-feed__body');
    }
  });
})(CRM.$);
