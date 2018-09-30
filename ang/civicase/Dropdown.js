(function ($, angular) {
  var module = angular.module('civicase');

  /**
   * This dropdown menu directive allows for nested dropdowns to work properly
   * and also allows interacting with elements inside of the dropdown without closing
   * it.
   */
  module.directive('civicaseDropdown', function () {
    return {
      link: function (scope, $element, attrs) {
        var $dropdownMenu = $element.find('.dropdown-menu:first');
        var $toggleElement = $element.find('[civicase-dropdown-toggle]:first');
        var isOpen = false;

        (function () {
          initEventListeners();
          removeEventListenersOnScopeDestroy();
        })();

        /**
         * Closes the dropdown menu when clicking outside of it or when clicking
         *
         * @param {Object} event the DOM event that was triggered by the click.
         */
        function closeDropdownOnClickOutside (event) {
          var targetIsButtonOrLink = $(event.target).is('button, a');
          var targetIsInsideDropdown = $dropdownMenu[0].contains(event.target);
          var targetIsInsideContainer = $element[0].contains(event.target);
          var targetIsADropdownToggleButton = $(event.target).is('[civicase-dropdown-toggle]');

          if (!targetIsInsideContainer || (targetIsInsideDropdown && targetIsButtonOrLink && !targetIsADropdownToggleButton)) {
            isOpen = false;
            $dropdownMenu.hide();
          }
        }

        /**
         * Closes the dropdown menu when the Escape key is pressed
         *
         * @param {Object} event the DOM event that was triggered by the key press.
         */
        function closeDropdownOnEscapeKeyPressed (event) {
          if (isOpen && event.key === 'Escape') {
            isOpen = false;

            event.stopImmediatePropagation();
            $dropdownMenu.hide();
          }
        }

        /**
         * Initializes the event listeners necesary to display or hide the dropdown menu.
         */
        function initEventListeners () {
          $toggleElement.on('click', toggleDropdown);
          $('body').on('keydown', closeDropdownOnEscapeKeyPressed);
          $(document).on('click', closeDropdownOnClickOutside);

          if (attrs.civicaseDropdownTrigger === 'hover') {
            $element.on('mouseover', showDropdown);
            $element.on('mouseout', hideDropdown);
          }
        }

        /**
         * Displays the dropdown menu.
         */
        function showDropdown () {
          isOpen = true;

          $dropdownMenu.show();
        }

        /**
         * Hides the dropdown menu.
         */
        function hideDropdown () {
          isOpen = false;

          $dropdownMenu.hide();
        }

        /**
         * Removes all attached events from the DOM when the scope is destroyed.
         */
        function removeEventListenersOnScopeDestroy () {
          scope.$on('$destroy', function () {
            $toggleElement.unbind('click', toggleDropdown);
            $('body').unbind('keydown', closeDropdownOnEscapeKeyPressed);
            $(document).unbind('click', closeDropdownOnClickOutside);
            $element.unbind('mouseover', showDropdown);
            $element.unbind('mouseout', hideDropdown);
          });
        }

        /**
         * Toggles the dropdown menu visibility
         */
        function toggleDropdown () {
          isOpen ? hideDropdown() : showDropdown();
        }
      }
    };
  });
})(CRM.$, angular);
