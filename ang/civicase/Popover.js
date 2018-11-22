(function ($, _, angular) {
  var module = angular.module('civicase');

  module.directive('civicasePopover', function ($document, $rootScope, $timeout, $uibPosition) {
    return {
      scope: {
        appendTo: '=',
        isOpen: '=?',
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
      var $bootstrapThemeContainer, $popover, $toggleButton;

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
       * Determines if the given position would either hide the popopver on the left or right
       * window's border.
       *
       * @param {Object} position
       * @return {Object}
       */
      function checkIfPositionHidesPopover (position) {
        return {
          left: position.left - $popover.width() < 0,
          right: position.left + $popover.width() > $(window).width()
        };
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
        var position, bootstrapThemeContainerOffset;
        direction = direction || 'bottom';
        position = $uibPosition.positionElements($element, $popover, direction, true);
        bootstrapThemeContainerOffset = $bootstrapThemeContainer.offset();

        return {
          top: position.top - bootstrapThemeContainerOffset.top,
          left: position.left - bootstrapThemeContainerOffset.left
        };
      }

      /**
       * Initiate popover reference
       */
      function initPopoverReference () {
        $popover = $element.find('.popover');

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
        var isHidden, position, positionReference;

        if (!$scope.isOpen) {
          return;
        }

        !$popover && initPopoverReference();

        positionReference = $scope.positionReference || $toggleButton;
        position = getPopoverPositionUnderElement(positionReference);
        isHidden = checkIfPositionHidesPopover(position);

        if (isHidden.left) {
          position = getPopoverPositionUnderElement(positionReference, 'bottom-left');
        } else if (isHidden.right) {
          position = getPopoverPositionUnderElement(positionReference, 'bottom-right');
        }

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
