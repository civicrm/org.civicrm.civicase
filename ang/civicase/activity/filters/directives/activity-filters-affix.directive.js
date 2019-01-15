(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityFiltersAffix', function ($rootScope, $timeout) {
    return {
      link: civicaseActivityFiltersAffix
    };

    /**
     * Link function for civicaseActivityFiltersAffix
     *
     * @param {Object} scope
     * @param {Object} $el
     * @param {Object} attr
     */
    function civicaseActivityFiltersAffix (scope, $el, attr) {
      var $filter, $feedBodyPanel, $tabs, $toolbarDrawer;

      (function init () {
        affixActivityFilters();
        $rootScope.$on('civicase::case-search::dropdown-toggle', resetAffix);
      }());

      /**
       * Sets Activity Filters affix offsets
       */
      function affixActivityFilters () {
        $filter = $('.civicase__activity-filter');
        $feedBodyPanel = $('.civicase__activity-filter ~ .panel-body');
        $tabs = $('.civicase__dashboard').length > 0 ? $('.civicase__dashboard__tab-container ul.nav') : $('.civicase__case-body_tab');
        $toolbarDrawer = $('#toolbar');

        $timeout(function () {
          $filter.affix({
            offset: {
              top: $filter.offset().top - ($toolbarDrawer.height() + $tabs.height())
            }
          }).on('affixed.bs.affix', function () {
            $filter.css('top', $toolbarDrawer.height() + $tabs.height());
            $feedBodyPanel.css('padding-top', $filter.outerHeight() + 15);
          }).on('affixed-top.bs.affix', function () {
            $filter.css('top', 'auto');
            $feedBodyPanel.css('padding-top', '15px');
          });
        });
      }

      /**
       * Resets Activity Filters affix offsets
       */
      function resetAffix () {
        $timeout(function () {
          // Reset right case view tab header
          if ($filter.data('bs.affix')) {
            $filter.data('bs.affix').options.offset.top = $filter.offset().top - ($toolbarDrawer.height() + $tabs.height());
          }
        });
      }
    }
  });
})(angular, CRM.$, CRM._);
