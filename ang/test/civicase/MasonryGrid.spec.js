/* eslint-env jasmine */

(function ($, _) {
  describe('Masonry Grid', function () {
    var $compile, $masonryGrid, $rootScope, $scope, $timeout;

    beforeEach(module('civicase', function ($compileProvider) {
      $compileProvider.directive('specialGridItem', function () {
        return {
          require: '^civicaseMasonryGrid',
          link: specialGridItemLink
        };

        function specialGridItemLink ($scope, $element, attrs, civicaseMasonryGrid) {
          $element.on('click', function () {
            civicaseMasonryGrid.addGridItemAt($element, $scope.specialPosition);
          });
        }
      });
    }));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

    describe('sorting out the grid items', function () {
      var leftColumnItems, rightColumnItems;

      describe('when given a list of masonry grid item', function () {
        beforeEach(function () {
          initDirective();

          leftColumnItems = getGridItemsTextsForColumn(0);
          rightColumnItems = getGridItemsTextsForColumn(1);
        });

        it('has the Special, 2nd, and 4th element on the left column', function () {
          expect(leftColumnItems).toBe('Special, 2, 4');
        });

        it('has the 1st, and 3rd, and 5th element on the right column', function () {
          expect(rightColumnItems).toBe('1, 3, 5');
        });
      });

      describe('when the Special item is removed', function () {
        beforeEach(function () {
          initDirective();

          $scope.showSpecial = false;

          $rootScope.$digest();
          $timeout.flush();

          leftColumnItems = getGridItemsTextsForColumn(0);
          rightColumnItems = getGridItemsTextsForColumn(1);
        });

        it('moves the 1st, 3rd, and 5th element to the left column', function () {
          expect(leftColumnItems).toBe('1, 3, 5');
        });

        it('moves the 2nd and 4th element to the right column', function () {
          expect(rightColumnItems).toBe('2, 4');
        });
      });

      describe('when the Special item requests to be moved to the 4th position', function () {
        beforeEach(function () {
          initDirective();

          $scope.specialPosition = 3; // zero based
          $masonryGrid.find('[special-grid-item]').click();

          $rootScope.$digest();
          $timeout.flush();

          leftColumnItems = getGridItemsTextsForColumn(0);
          rightColumnItems = getGridItemsTextsForColumn(1);
        });

        it('moves the 1st, 3rd, and 5th element to the left column', function () {
          expect(leftColumnItems).toBe('1, 3, 4');
        });

        it('moves the 2nd and 4th element to the right column', function () {
          expect(rightColumnItems).toBe('2, Special, 5');
        });
      });

      /**
       * Returns a string representation of the elements inside a given column.
       * Ex.: "1, 2, Special, 3"
       *
       * @param {Number} columnIndex
       * @return {String}
       */
      function getGridItemsTextsForColumn (columnIndex) {
        return $masonryGrid.find('.civicase__masonry-grid__container')
          .eq(columnIndex)
          .find('[civicase-masonry-grid-item]')
          .map(function () {
            return $(this).text().trim();
          })
          .get()
          .join(', ');
      }
    });

    /**
     * Initialzes the masonry grid directive.
     */
    function initDirective () {
      var html = `<div civicase-masonry-grid>
        <div civicase-masonry-grid-item
          special-grid-item
          ng-if="showSpecial">
          Special
        </div>
        <div ng-repeat="i in [1,2,3,4,5]"
          civicase-masonry-grid-item>
          {{i}}
        </div>

      </div>`;
      $scope = $rootScope.$new();
      $scope.showSpecial = true;
      $masonryGrid = $compile(html)($scope);

      $rootScope.$digest();
      $timeout.flush();
    }
  });
})(CRM.$, CRM._);
