(function ($, angular) {
  var module = angular.module('civicase');

  module.factory('ActivityPanelMeasurements', function ($document) {
    return function ActivityPanelMeasurements ($activityPanel) {
      var $filter, $feedListContainer, $panelActionBar, $panelHeader,
        $panelSubHeader, $tabs, $toolbarDrawer;

      (function init () {
        $filter = $('.civicase__activity-filter');
        $feedListContainer = $('.civicase__activity-feed__body');
        $panelHeader = $activityPanel.find('.panel-heading');
        $panelSubHeader = $activityPanel.find('.panel-subheading');
        $tabs = $('.civicase__dashboard').length > 0 ? $('.civicase__dashboard__tab-container ul.nav') : $('.civicase__case-body_tab');
        $toolbarDrawer = $('#toolbar');
      })();

      return {
        getBottomOffset: getBottomOffset,
        getDistanceFromTop: getDistanceFromTop,
        getPanelBodyTopOffset: getPanelBodyTopOffset,
        getTopOffset: getTopOffset
      };

      /**
       * Returns the offset from bottom for the affix functionality
       *
       * @return {Number}
       */
      function getBottomOffset () {
        return $($document).height() - ($feedListContainer.offset().top + $feedListContainer.height());
      }

      /**
       * Returns the Distance of Activity Panel from top of the screen
       *
       * @return {Number}
       */
      function getDistanceFromTop () {
        return $toolbarDrawer.height() + $tabs.height() + $filter.outerHeight();
      }

      /**
       * Returns the top offset for the panel body in relationship to the panel's top position.
       *
       * @return {Number}
       */
      function getPanelBodyTopOffset () {
        var topOffset = getDistanceFromTop();
        $panelActionBar = $activityPanel.find('.crm-submit-buttons');

        return topOffset + $panelHeader.outerHeight() + $panelSubHeader.outerHeight() + $panelActionBar.outerHeight();
      }

      /**
       * Returns the offset from top for the affix functionality
       *
       * @return {Number}
       */
      function getTopOffset () {
        return $activityPanel.offset().top - getDistanceFromTop();
      }
    };
  });
})(CRM.$, angular);
