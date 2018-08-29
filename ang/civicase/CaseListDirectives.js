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
     * @function
     * Link function for stickyTableHeader Directive
     *
     * @params
     * scope: Scope under which directive is called
     * $el: Element on which directive is called
     * attrs: attributes of directive
     */
    function stickyTableHeaderLink (scope, $el, attrs) {
      var $table = $el;
      var $header = $el.find('thead');

      // Watch if loading completes
      (function init () {
        // Watch if loading completes
        scope.$watch('isLoading', checkIfLoadingCompleted);
      }());

      function checkIfLoadingCompleted (loading) {
        if (!loading) { // loading complete
          var bodyPadding = parseInt($('body').css('padding-top'), 10); // to see the space for fixed menus
          var topPos = $header.offset().top - bodyPadding;

          // Assign min-width values to th to have solid grid
          $timeout(function () {
            $('th', $header).each(function () {
              $(this).css('min-width', $(this).outerWidth() + 'px');
            });
          }, 0);

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
     * @function
     * Link function for stickyFooterPager Directive
     *
     * @params
     * scope: Scope under which directive is called
     * $el: Element on which directive is called
     * attrs: attributes of directive
     */
    function stickyFooterPagerLink (scope, $el, attrs) {
      // Watch if loading completes
      (function init () {
        // Watch if loading completes
        scope.$watch('isLoading', checkIfLoadingCompleted);
      }());

      function checkIfLoadingCompleted (loading) {
        if (!loading) { // If loading completes
          var topPos = $el.offset().top;
          // apply Fixed pager logic
          applyFixedPager(topPos);
          // Same logic to window scroll
          $($window).scroll(function () {
            applyFixedPager(topPos);
          });
        }
      }

      // Function to see ee if element is in window view and add class likewise
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
