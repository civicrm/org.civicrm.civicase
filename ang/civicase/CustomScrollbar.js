/* global SimpleBar */
/* eslint-disable no-new */
(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCustomScrollbar', function ($rootScope, $parse, $timeout) {
    return {
      restrict: 'A',
      link: civicaseCustomScrollbarLink
    };

    /**
     * Link function for civicaseCustomScrollbar
     *
     * @param {Object} $scope
     * @param {jQuery} element
     * @param {Object} attrs
     */
    function civicaseCustomScrollbarLink ($scope, element, attrs) {
      var options = {
        autoHide: false
      };

      if (attrs.civicaseCustomScrollbar) {
        options = $parse(attrs.scrollbarConfig)();
      }

      (function init () {
        initScrollbar();
        initSubscribers();
      }());

      /**
       * Initiate scrollbar plugin
       */
      function initScrollbar () {
        new SimpleBar(element[0], options);
      }

      /**
       * Initiate Subscribers
       */
      function initSubscribers () {
        $rootScope.$on('civicase::custom-scrollbar::recalculate', recalculateSubscriber);
      }

      /**
       * Subscriber for 'civicase::custom-scrollbar::recalculate' event
       *
       * @param {Event} event
       * @param {DOMElement} element
       */
      function recalculateSubscriber (event, element) {
        if (element.SimpleBar) {
          $timeout(function () {
            element.SimpleBar.recalculate();
          });
        }
      }
    }
  });
})(angular, CRM.$, CRM._);
