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
        distanceFromTop, monthNavTopOffset;

      (function init () {
        scope.$watch('isLoading', checkIfReadyForAffix);
        scope.$watch('isVisible', checkIfReadyForAffix);
      }());

      /**
       * Check if Affix should be initialised
       */
      function checkIfReadyForAffix () {
        if (!scope.isLoading && scope.isVisible) {
          $timeout(affixMonthNav);
          initResetAffixWatchers();
        }
      }

      /**
       * Sets Activity Month Nav
       */
      function affixMonthNav () {
        $filter = $('.civicase__activity-filter');
        $toolbarDrawer = $('#toolbar');
        $monthNav = $el.find('.civicase__activity-month-nav');
        $feedListContainer = $('.civicase__activity-feed__body');
        monthNavTopOffset = $monthNav.offset().top;
        $tabs = $('.civicase__dashboard').length > 0
          ? $('.civicase__dashboard__tab-container ul.nav')
          : $('.civicase__case-body_tab');

        distanceFromTop = $filter.outerHeight() + $toolbarDrawer.height() + $tabs.height();

        $monthNav.affix({
          offset: {
            top: monthNavTopOffset - distanceFromTop,
            bottom: $($document).height() - ($feedListContainer.offset().top + $feedListContainer.height())
          }
        });

        $monthNav.on('affixed.bs.affix', function () {
          $monthNav.css('top', distanceFromTop);
        }).on('affixed-top.bs.affix', function () {
          $monthNav.css('top', 'auto');
        });
      }

      /**
       * Initialise watchers to reset affix
       */
      function initResetAffixWatchers () {
        scope.$on('civicase::case-search::dropdown-toggle', function () {
          resetAffix(true);
        });
        scope.$on('civicase::activity-filters::more-filters-toggled', function () {
          resetAffix();
        });
        scope.$on('civicaseActivityFeed.query', function () {
          resetAffix();
        });
      }

      /**
       * Resets Activity Month Nav affix offsets
       *
       * @param {Boolean} recalculateTopOffset
       */
      function resetAffix (recalculateTopOffset) {
        $timeout(function () {
          if (!$monthNav.data('bs.affix')) {
            return;
          }

          if (recalculateTopOffset) {
            monthNavTopOffset = $monthNav.offset().top;
          }

          distanceFromTop = $filter.outerHeight() + $toolbarDrawer.height() + $tabs.height();

          $monthNav.data('bs.affix').options.offset.top = monthNavTopOffset - distanceFromTop;
        });
      }
    }
  });
})(angular, CRM.$, CRM._);
