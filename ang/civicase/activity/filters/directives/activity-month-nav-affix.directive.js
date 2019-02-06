(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityMonthNavAffix', function ($rootScope, $timeout, $document) {
    return {
      link: civicaseActivityMonthNavAffixLink
    };

    /**
     * Link function for civicaseActivityMonthNavAffix
     *
     * @param {Object} scope
     * @param {Object} $el
     * @param {Object} attr
     */
    function civicaseActivityMonthNavAffixLink (scope, $el, attr) {
      var $filter, $tabs, $toolbarDrawer, $monthNav, $feedListContainer,
        topOffset;

      (function init () {
        affixMonthNav();
        $rootScope.$on('civicase::case-search::dropdown-toggle', resetAffix);
      }());

      /**
       * Sets Activity Month Nav
       */
      function affixMonthNav () {
        $filter = $('.civicase__activity-filter');
        $toolbarDrawer = $('#toolbar');
        $monthNav = $el.find('.civicase__activity-month-nav');
        $feedListContainer = $('.civicase__activity-feed__body');
        $tabs = $('.civicase__dashboard').length > 0
          ? $('.civicase__dashboard__tab-container ul.nav')
          : $('.civicase__case-body_tab');

        topOffset = $filter.height() + $toolbarDrawer.height() + $tabs.height();

        $timeout(function () {
          $monthNav.affix({
            offset: {
              top: $monthNav.offset().top - topOffset,
              bottom: $($document).height() - ($feedListContainer.offset().top + $feedListContainer.height())
            }
          }).on('affixed.bs.affix', function () {
            $monthNav.css('top', topOffset);
          }).on('affixed-top.bs.affix', function () {
            $monthNav.css('top', 'auto');
          });
        });
      }

      /**
       * Resets Activity Month Nav affix offsets
       */
      function resetAffix () {
        $timeout(function () {
          if ($monthNav.data('bs.affix')) {
            $monthNav.data('bs.affix').options.offset.top = $monthNav.offset().top - topOffset;
          }
        });
      }
    }
  });
})(angular, CRM.$, CRM._);
