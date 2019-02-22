(function ($, angular) {
  var module = angular.module('civicase');

  module.service('ActivityFeedMeasurements', function () {
    this.getTopOffset = getTopOffset;

    /**
     * Returns the offset of feed body from top
     *
     * @return {Number}
     */
    function getTopOffset () {
      var $feedBody = $('.civicase__activity-feed__body');
      var topOffset = $feedBody.offset().top + 24; // 24px is the padding-top of `panel-body` of the feed

      return topOffset;
    }
  });
})(CRM.$, angular);
