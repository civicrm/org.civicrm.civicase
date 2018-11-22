/* eslint-env jasmine */

(function ($) {
  describe('Popover', function () {
    var $compile, $rootScope, $scope, $sampleReference, $toggleButton, $uibPosition,
      popover;

    beforeEach(module('civicase', 'civicase.templates'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$uibPosition_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $uibPosition = _$uibPosition_;
    }));

    beforeEach(function () {
      $scope = $rootScope.$new();

      initDirective();

      // Modifies the position and width for both the sample reference and toggle button elements:
      $()
        .add($sampleReference)
        .add($toggleButton)
        .css({
          position: 'absolute',
          left: '50%',
          width: '10px'
        });
    });

    afterEach(function () {
      removeTestDomElements();
    });

    describe('opening the popover', function () {
      describe('when the component initializes', function () {
        it('hides the popover content', function () {
          expect(popover.find('civicase-popover-content').is(':visible')).toBe(false);
        });

        it('displays the toggle button', function () {
          expect($toggleButton.is(':visible')).toBe(true);
        });
      });

      describe('when clicking on the toggle button', function () {
        var expectedPosition, currentPosition;

        beforeEach(function () {
          $toggleButton.click();
          $rootScope.$digest();

          expectedPosition = getPopoverExpectedPositionUnderElement($toggleButton);
          currentPosition = getPopoverCurrentPosition();
        });

        it('displays the popover content', function () {
          expect(popover.find('civicase-popover-content').is(':visible')).toBe(true);
        });

        it('displays the popover under the toggle button', function () {
          expect(currentPosition).toEqual(expectedPosition);
        });

        it('appends the popover to the bootstrap theme container', function () {
          expect($('#bootstrap-theme .popover').length).toBe(1);
        });
      });

      describe('when "is open" is set to true', function () {
        beforeEach(function () {
          $scope.isOpen = true;
          $rootScope.$digest();
        });

        it('displays the popover content', function () {
          expect(popover.find('civicase-popover-content').is(':visible')).toBe(true);
        });
      });
    });

    describe('when the popover is open', function () {
      beforeEach(function () {
        popover.find('civicase-popover').isolateScope().isOpen = true;
      });

      describe('and the user clicks outside of the popover', function () {
        beforeEach(function () {
          $('body').click();
        });

        it('closes the popover', function () {
          expect($('civicase-popover-content').is(':visible')).toBe(false);
        });
      });
    });

    describe('opening the popover on top of a specific element', function () {
      var currentPosition, expectedPosition;

      describe('when the position reference is provided', function () {
        beforeEach(function () {
          $scope.positionReference = $sampleReference;
          $scope.isOpen = true;

          $scope.$digest();

          expectedPosition = getPopoverExpectedPositionUnderElement($sampleReference);
          currentPosition = getPopoverCurrentPosition();
        });

        it('displays the popover under the given element', function () {
          expect(currentPosition).toEqual(expectedPosition);
        });
      });
    });

    describe('when the popover is hidden by the windows border', function () {
      var currentPosition, expectedPosition;

      beforeEach(function () {
        $scope.positionReference = $sampleReference;
        $scope.isOpen = true;
      });

      describe('when the popover is hidden by the windows left border', function () {
        beforeEach(function () {
          $sampleReference.css({ left: 0 });
          $scope.$digest();

          expectedPosition = getPopoverExpectedPositionUnderElement($sampleReference, 'bottom-left');
          currentPosition = getPopoverCurrentPosition();
        });

        it('displays the popover inside of the window', function () {
          expect(currentPosition).toEqual(expectedPosition);
        });
      });

      describe('when the popover is hidden by the windows right border', function () {
        beforeEach(function () {
          $sampleReference.css({ left: $(window).width() });
          $scope.$digest();

          expectedPosition = getPopoverExpectedPositionUnderElement($sampleReference, 'bottom-right');
          currentPosition = getPopoverCurrentPosition();
        });

        it('displays the popover inside of the window', function () {
          expect(currentPosition).toEqual(expectedPosition);
        });
      });
    });

    /**
     * Returns the current position of the popover element.
     *
     * @return {Object} with the top and left properties representing the popover position.
     */
    function getPopoverCurrentPosition () {
      var $popover = popover.find('.popover');

      return $popover.css(['top', 'left']);
    }

    /**
     * Returns the position the popover should have if positioned against the given
     * element.
     *
     * @return {Object} with the top and left properties representing the popover position.
     */
    function getPopoverExpectedPositionUnderElement ($element, direction) {
      var $popover = popover.find('.popover');
      var $bootstrapThemeContainer = $('#bootstrap-theme');
      var position = $uibPosition.positionElements($element, $popover, (direction || 'bottom'), true);
      var bootstrapThemeContainerOffset = $bootstrapThemeContainer.offset();

      return {
        top: position.top - bootstrapThemeContainerOffset.top + 'px',
        left: position.left - bootstrapThemeContainerOffset.left + 'px'
      };
    }

    /**
     * Initializes the directive and appends it to the body.
     */
    function initDirective () {
      var testHtml = $(`
        <div class="civicase-popover-test">
          <style>
            /* Ensures the popover is smaller than the current window's width: */
            .popover {
              width: 100px;
            }
          </style>
          <div id="bootstrap-theme"></div>
          <i class="sample-reference">Sample reference element</i>
          <civicase-popover
            position-reference="positionReference"
            is-open="isOpen">
            <civicase-popover-toggle-button>
              When you click here,
            </civicase-popover-toggle-button>
            <civicase-popover-content>
              Then you can see this.
            </civicase-popover-content>
          </civicase-popover>
        </div>
      `);

      testHtml.appendTo('body');

      popover = $compile(testHtml)($scope);

      $rootScope.$digest();

      $toggleButton = popover.find('civicase-popover-toggle-button');
      $sampleReference = $('.sample-reference');
    }

    /**
     * Removes DOM elements added by this spec.
     */
    function removeTestDomElements () {
      $('.civicase-popover-test').remove();
    }
  });
})(CRM.$);
