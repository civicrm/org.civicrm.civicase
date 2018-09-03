/**
 * @file
 * This file contains directives used for Case lists
 */

(function (angular) {
  var module = angular.module('civicase');
  var $ = angular.element;

  /**
   * Directive for the sticky table header functionality on case list page
   */
  module.directive('stickyTableHeader', function ($timeout) {
    return {
      restrict: 'A',
      link: stickyTableHeaderLink
    };

    /**
     * Link function for stickyTableHeader Directive
     *
     * @param {object} scope
     *   Scope under which directive is called
     * @param {object} $el
     *   Element on which directive is called
     * @param {object} attrs
     *   attributes of directive
     */
    function stickyTableHeaderLink (scope, $el, attrs) {
      var $table = $el;
      var $header = $el.find('thead');

      (function init () {
        scope.$watch('isLoading', checkIfLoadingCompleted);
      }());

      /**
       * Checks if loading completes and add logic
       * for fixed footer
       *
       * @param {boolean} loading
       */
      function checkIfLoadingCompleted (loading) {
        if (!loading) {
          /**
           * Assign min-width values to th to have solid grid
           * Timeout if 0s added to execute logic after DOM repainting completes
           */
          $timeout(function () {
            var bodyPadding = parseInt($('body').css('padding-top'), 10); // to see the space for fixed menus
            var topPos = $header.offset().top - bodyPadding;

            $('th', $header).each(function () {
              $(this).css('min-width', $(this).outerWidth() + 'px');
            });

            // Define when to make the element sticky (affixed)
            $($header).affix({
              offset: {
                top: topPos
              }
            })
            // After element is affixed set scrolling pos (to avoid glitch) and top position
              .on('affixed.bs.affix', function () {
                $header.scrollLeft($table.scrollLeft());
                $header.css('top', bodyPadding + 'px');
              });

            // Attach scroll function
            $table.scroll(function () {
              $header.scrollLeft($(this).scrollLeft());
            });
          }, 0);
        }
      }
    }
  });

  /**
   * Directive for the sticky pager footer functionality on case list page
   */
  module.directive('stickyFooterPager', function ($window) {
    return {
      restrict: 'A',
      link: stickyFooterPagerLink
    };

    /**
     * Link function for stickyFooterPager Directive
     *
     * @param {object} scope
     *   Scope under which directive is called
     * @param {object} $el
     *   Element on which directive is called
     * @param {object} attrs
     *   attributes of directive
     */
    function stickyFooterPagerLink (scope, $el, attrs) {
      (function init () {
        scope.$watch('isLoading', checkIfLoadingCompleted);
      }());

      /**
       * Checks if loading completes and add logic
       * for fixed footer
       *
       * @param {boolean} loading
       */
      function checkIfLoadingCompleted (loading) {
        if (!loading) {
          var topPos = $el.offset().top;

          applyFixedPager(topPos);

          $($window).scroll(function () {
            applyFixedPager(topPos);
          });
        }
      }

      /**
       * Applies fixed pager class based on scroll position
       *
       * @param {int} topPos
       */
      function applyFixedPager (topPos) {
        if ((topPos - $($window).height() - $($window).scrollTop()) > 0) {
          $el.addClass('civicase__pager--fixed');
        } else {
          $el.removeClass('civicase__pager--fixed');
        }
      }
    }
  });
})(angular);
