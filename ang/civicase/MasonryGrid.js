(function (_, $, angular) {
  var module = angular.module('civicase');

  module.directive('civicaseMasonryGrid', function ($timeout) {
    return {
      restrict: 'E',
      controller: 'civicaseMasonryGridController',
      link: civicaseMasonryGridLink
    };

    /**
     * Masonry Grid link function.
     *
     * @param {Object} $scope the directive's scope.
     * @param {Object} $element a reference to the directive's element.
     * @param {Object} attrs a map of attributes associated to the element.
     * @param {Object} masonryGrid a reference to the directive's controller.
     */
    function civicaseMasonryGridLink ($scope, $element, attrs, masonryGrid) {
      (function init () {
        $timeout(function () {
          appendMasonryContainers();
          arrangeGridItems();
          $scope.$on('civicaseMasonryGrid::updated', arrangeGridItems);
        });
      })();

      /**
       * Appends the masonry containers used for splitting the grid items.
       */
      function appendMasonryContainers () {
        _.times(2).forEach(function () {
          $('<div></div>')
            .addClass('civicase__summary-tab-tile')
            .addClass('civicase__masonry-grid__container')
            .appendTo($element);
        });
      }

      /**
       * Sorts the grid items into one of the two grid containers.
       */
      function arrangeGridItems () {
        $element.find('civicase-masonry-grid-item').detach();

        masonryGrid.$gridItems.forEach(function ($gridItem, index) {
          var columnIndex = index % 2;
          var $column = $element.find('.civicase__masonry-grid__container').eq(columnIndex);

          $gridItem.appendTo($column);
        });
      }
    }
  });

  module.controller('civicaseMasonryGridController', function ($scope) {
    var vm = this;
    vm.$gridItems = [];

    /**
     * Adds an item element to the grid.
     *
     * @param {Object} $gridItem a reference to the item element to be added.
     */
    vm.addGridItem = function ($gridItem) {
      _.remove(vm.$gridItems, $gridItem);
      vm.$gridItems.push($gridItem);
      $scope.$emit('civicaseMasonryGrid::updated');
    };

    /**
     * Adds an item element to the grid at the given index.
     *
     * @param {Object} $gridItem a reference to the item element to be added.
     */
    vm.addGridItemAt = function ($gridItem, atIndex) {
      _.remove(vm.$gridItems, $gridItem);
      vm.$gridItems.splice(atIndex, 0, $gridItem);
      $scope.$emit('civicaseMasonryGrid::updated');
    };

    /**
     * Removes the item element from the grid.
     *
     * @param {Object} $gridItem a reference to the item element to be removed.
     */
    vm.removeGridItem = function ($gridItem) {
      _.remove(vm.$gridItems, $gridItem);
      $scope.$emit('civicaseMasonryGrid::updated');
    };
  });

  module.directive('civicaseMasonryGridItem', function () {
    return {
      restrict: 'E',
      require: '^civicaseMasonryGrid',
      link: civicaseMasonryGridItemLink
    };

    /**
     * Masonry grid item link function.
     *
     * @param {Object} $scope the directive's scope.
     * @param {Object} $element a reference to the directive's element.
     * @param {Object} attrs a map of attributes associated to the element.
     * @param {Object} masonryGrid a reference to the parent masonry grid directive's controller.
     */
    function civicaseMasonryGridItemLink ($scope, $element, attrs, masonryGrid) {
      (function init () {
        if (attrs.position) {
          masonryGrid.addGridItemAt($element, attrs.position);
        } else {
          masonryGrid.addGridItem($element);
        }

        $scope.$on('$destroy', function () {
          masonryGrid.removeGridItem($element);
        });
      })();
    }
  });
})(CRM._, CRM.$, angular);
