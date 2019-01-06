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
  module.directive('civicaseStickyTableHeader', function ($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: civicaseStickyTableHeaderLink
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
    function civicaseStickyTableHeaderLink (scope, $el, attrs) {
      var $toolbarDrawer = $('#toolbar');
      var $table = $el;
      var $header = $el.find('thead');

      (function init () {
        initWatchers();
        initSubscribers();
      }());

      /**
       * Initialise all watchers
       */
      function initWatchers () {
        scope.$watch('isLoading', fixPositioningOnLoadingOrFocusChange);
        scope.$watch('caseIsFocused', fixPositioningOnLoadingOrFocusChange);
      }

      /**
       * Initialise all subscribers
       */
      function initSubscribers () {
        $rootScope.$on('civicase::case-search::dropdown-toggle', reAdjustFixedHeader);
        $rootScope.$on('civicase::bulk-actions::bulk-message-toggle', reAdjustFixedHeader);
      }

      /**
       * Loads only if loading completes and case is not focused
       * for fixed header
       *
       * @param {boolean} loading
       */
      function fixPositioningOnLoadingOrFocusChange () {
        if (!scope.loading && !scope.caseIsFocused) {
          computeFixPositioning();
        }
      }

      /**
       * Assign min-width values to th to have solid grid
       * Timeout if 0s added to execute logic after DOM repainting completes
       */
      function computeFixPositioning () {
        $timeout(function () {
          var bodyPadding = parseInt($('body').css('padding-top'), 10); // to see the space for fixed menus
          var topPos = $header.offset().top - bodyPadding;

          $('th', $header).each(function () {
            $(this).css('min-width', $(this).outerWidth() + 'px');
          });

          // Define when to make the element sticky (affixed)
          $header.affix({
            offset: {
              top: topPos
            }
          })
          // After element is affixed set scrolling pos (to avoid glitch) and top position
            .on('affixed.bs.affix', function () {
              $header.scrollLeft($table.scrollLeft()); // Bind scrolling
              $header.css('top', bodyPadding + 'px'); // Set top pos to body padding so that it don't overlap with the toolbar
              $toolbarDrawer.is(':visible') && $table.css('padding-top', $header.height() + 'px'); // Add top padding to remove the glitch when header moves out of DOM relative position
            })
            .on('affixed-top.bs.affix', function () {
              $header.css('top', 0); // Resets top pos when in default state
              $table.css('padding-top', 0); // Resets padding top when in default state
            });

          // Attach scroll function
          $table.scroll(function () {
            $header.scrollLeft($(this).scrollLeft());
          });
        }, 0);
      }

      /**
       * Subscriber for fixed header
       */
      function reAdjustFixedHeader () {
        $timeout(function () {
          var bodyPadding = parseInt($('body').css('padding-top'), 10); // to see the space for fixed menus

          if ($header.data('bs.affix')) {
            $header.data('bs.affix').options.offset.top = $header.offset().top - bodyPadding;
          }
        });
      }
    }
  });

  /**
   * Directive for the sticky pager footer functionality on case list page
   */
  module.directive('civicaseStickyFooterPager', function ($window, $timeout) {
    return {
      restrict: 'A',
      link: civicaseStickyFooterPagerLink
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
    function civicaseStickyFooterPagerLink (scope, $el, attrs) {
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
          var topPos;

          // $timeout is required to wait for the UI rendering to complete,
          // to get the correct offset of the element.
          $timeout(function () {
            topPos = $el.offset().top;
            applyFixedPager(topPos);
          });

          $($window).scroll(function () {
            applyFixedPager(topPos);
          });
        } else {
          $el.removeClass('civicase__pager--fixed');
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
       * Initiate the sort functionality if the header is sortable
       */
      function initiateSortFunctionality () {
        if (scope.sort.sortable && attrs.civicaseCaseListSortHeader !== '') {
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
        element.toggleClass('active', attrs.civicaseCaseListSortHeader === scope.sort.field);
        element.find('.civicase__case-list__header-toggle-sort').remove();

        if (attrs.civicaseCaseListSortHeader === scope.sort.field) {
          var direction = scope.sort.dir === 'ASC' ? 'up' : 'down';
          var sortIcon = '<i class="civicase__case-list__header-toggle-sort material-icons">arrow_' + direction + 'ward</i>';
          element.append(sortIcon);
        }
      }
    }
  });
})(angular);
