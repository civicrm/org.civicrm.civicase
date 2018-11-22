(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicasePopover', function ($document, $rootScope, $timeout, $uibPosition) {
    return {
      scope: {
        appendTo: '=',
        isOpen: '=?',
        popoverClass: '@',
        positionReference: '=',
        triggerEvent: '=?'
      },
      transclude: {
        toggleButton: '?civicasePopoverToggleButton',
        content: 'civicasePopoverContent'
      },
      templateUrl: '~/civicase/Popover.html',
      link: civicasePopoverLink
    };

    function civicasePopoverLink ($scope, $element, attrs, ctrl, $transcludeFn) {
      var $bootstrapThemeContainer, $popover, $popoverArrow, $toggleButton;
      var ARROW_POSITION_VALUES = {
        'default': '50%',
        'bottom-left': '%width%px',
        'bottom-right': 'calc(100% - %width%px)'
      };

      (function init () {
        $bootstrapThemeContainer = $('#bootstrap-theme');
        $toggleButton = $element.find('civicase-popover-toggle-button');
        $scope.triggerEvent = $scope.triggerEvent || 'click';
        $scope.isOpen = false;

        transcludeElements();
        initWatchers();
        attachEventListeners();
      })();

      /**
       * Switch between open/ closed state
       */
      $scope.togglePopoverState = function () {
        $scope.isOpen = !$scope.isOpen;
      };

      function attachEventListeners () {
        var $body = $('body');
        var closeEventHasBeenAttached = $body.hasClass('civicase__popup-attached');

        $toggleButton.on($scope.triggerEvent, function (event) {
          if (!$scope.isOpen) {
            $rootScope.$broadcast('civicase::popover::close-all');
          }

          $scope.togglePopoverState();
          event.stopPropagation();
          $scope.$digest();
        });

        $scope.$on('civicase::popover::close-all', function () {
          $scope.isOpen = false;
        });

        if (!closeEventHasBeenAttached) {
          $document.on('click', function ($event) {
            var isNotInsideAPopoverBox = $('.civicase__popover-box').find($event.target).length === 0;

            if (isNotInsideAPopoverBox) {
              $rootScope.$broadcast('civicase::popover::close-all');
              $rootScope.$digest();
            }
          });
          $body.addClass('civicase__popup-attached');
        }
      }

      /**
       * Returns the number of pixes the popover needs to be adjusted to take into
       * consideration the position of the popover arrow.
       *
       * @param {String} direction the direction the popover will be aligned to.
       */
      function getArrowPositionModifier (direction) {
        if (direction === 'bottom-left') {
          return $popoverArrow.outerWidth() / 2 * -1;
        } else if (direction === 'bottom-right') {
          return $popoverArrow.outerWidth() / 2;
        } else {
          return 0;
        }
      }

      /**
       * Determines which direction the popover should be displayed as given a position.
       * If the position would make the popover hidden from the viewport, it will return
       * the proper alignment, otherwise it returns "default".
       *
       * @param {Object} position
       * @return {String}
       */
      function getPopoverDirection (position) {
        var directions = {
          'bottom-left': position.left - $popover.width() < 0,
          'bottom-right': position.left + $popover.width() > $(window).width()
        };

        return _.findKey(directions, function (isDirectionHidden) {
          return isDirectionHidden;
        }) || 'default';
      }

      /**
       * Get the left and top position for the popover relative to the given element
       * and direction.
       *
       * @param {Object} $element the DOM element to use as reference.
       * @param {String} direction which can be "bottom", "bottom-left", "bottom-right", etc.
       *   defaults to "bottom".
       */
      function getPopoverPositionUnderElement ($element, direction) {
        var arrowPositionModifier, position, bootstrapThemeContainerOffset;
        direction = direction || 'bottom';
        position = $uibPosition.positionElements($element, $popover, direction, true);
        bootstrapThemeContainerOffset = $bootstrapThemeContainer.offset();
        arrowPositionModifier = getArrowPositionModifier(direction);

        return {
          top: position.top - bootstrapThemeContainerOffset.top,
          left: position.left - bootstrapThemeContainerOffset.left + arrowPositionModifier
        };
      }

      /**
       * Initiate popover reference
       */
      function initPopoverReference () {
        $popover = $element.find('.popover');
        $popoverArrow = $popover.find('.arrow');

        $popover.appendTo($scope.appendTo ? $($scope.appendTo) : $bootstrapThemeContainer);
      }

      /**
       * Initiate Watchers
       */
      function initWatchers () {
        $scope.$watch('isOpen', repositionPopover);
        $scope.$watch('positionReference', repositionPopover);
      }

      /**
       * Reposition the popover element
       */
      function repositionPopover () {
        var arrowPosition, popoverDirection, position, positionReference;

        if (!$scope.isOpen) {
          return;
        }

        initPopoverReference();

        positionReference = $scope.positionReference || $toggleButton;
        position = getPopoverPositionUnderElement(positionReference);
        popoverDirection = getPopoverDirection(position);
        arrowPosition = ARROW_POSITION_VALUES.default;

        if (popoverDirection !== 'default') {
          position = getPopoverPositionUnderElement(positionReference, popoverDirection);
          arrowPosition = ARROW_POSITION_VALUES[popoverDirection].replace('%width%', $popoverArrow.outerWidth());
        }

        $popoverArrow.css('left', arrowPosition);
        $popover.css(position);
      }

      /**
       * Transclude elements copy
       */
      function transcludeElements () {
        $transcludeFn($scope, function (clone, scope) {
          $element.find('[ng-transclude="content"]').html(clone);
        }, false, 'content');
      }
    }
  });
})(CRM.$, CRM._, angular);
