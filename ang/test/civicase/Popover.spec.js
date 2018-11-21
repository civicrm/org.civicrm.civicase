/* eslint-env jasmine */

(function ($) {
  fdescribe('Popover', function () {
    var $compile, $rootScope, $scope, $toggleButton, $uibPosition, popover;

    beforeEach(module('civicase', 'civicase.templates'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$uibPosition_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $uibPosition = _$uibPosition_;
    }));

    beforeEach(function () {
      initDirective();
    });

    afterEach(function () {
      $('.civicase-popover-test').remove();
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
    function getPopoverExpectedPositionUnderElement ($element) {
      var $popover = popover.find('.popover');
      var $bootstrapThemeContainer = $('#bootstrap-theme');
      var position = $uibPosition.positionElements($element, $popover, 'bottom', true);
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
          <div id="bootstrap-theme"></div>
          <civicase-popover>
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

      $scope = $rootScope.$new();
      popover = $compile(testHtml)($scope);

      $rootScope.$digest();

      $toggleButton = popover.find('civicase-popover-toggle-button');
    }
  });
})(CRM.$);
