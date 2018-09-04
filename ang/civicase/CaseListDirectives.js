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

  /**
   * Directive for the case list sortable headers
   */
  module.directive('civicaseCaseListSortHeader', function () {
    return {
      restrict: 'A',
      link: civicaseSortheaderLink
    };

    /**
     * Link function for civicaseSortheaderLink Directive
     *
     * @param {object} scope
     * @param {object} $el
     * @param {object} attrs
     */
    function civicaseSortheaderLink (scope, element, attrs) {
      (function init () {
        initiateSortFunctionality();
        scope.$watchCollection('sort', sortWatchHandler);
      }());

      /**
       * Change Sort Direction
       */
      scope.changeSortDir = function () {
        scope.sort.dir = (scope.sort.dir === 'ASC' ? 'DESC' : 'ASC');
      };

      /**
       * Initiate the sort functionality if the header is sortable
       */
      function initiateSortFunctionality () {
        if (scope.sort.sortable && attrs.civicaseSortheader !== '') {
          element
            .addClass('civicase__case-list-sortable-header')
            .on('click', headerClickEventHandler);
        }
      }

      /**
       * Click event for the header
       * If the Clicked field is already selected, change the direction
       * Otherwise, set the new field and direction as ascending
       */
      function headerClickEventHandler () {
        scope.$apply(function () {
          if (scope.sort.field === attrs.civicaseCaseListSortHeader) {
            scope.changeSortDir();
          } else {
            scope.sort.field = attrs.civicaseCaseListSortHeader;
            scope.sort.dir = 'ASC';
          }
        });
      }

      /**
       * Watch event for the Sort property
       */
      function sortWatchHandler () {
        var sortIcon = '<i class="civicase__case-list__header-toggle-sort material-icons">arrow_' + (scope.sort.dir === 'ASC' ? 'up' : 'down') + 'ward</i>';

        element.toggleClass('sorting', attrs.civicaseCaseListSortHeader === scope.sort.field);
        element.find('.civicase__case-list__header-toggle-sort').remove();

        if (attrs.civicaseCaseListSortHeader === scope.sort.field) {
          element.append(sortIcon);
        }
      }
    }
  });
})(angular);
