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
      var $feedPanelBody = $('.civicase__activity-feed>.panel-body');
      var feedPanelBodyPaddingTop = parseInt($feedPanelBody.css('padding-top'));
      var topOffset = $feedBody.offset().top + feedPanelBodyPaddingTop;

      return topOffset;
    }
  });
})(CRM.$, angular);
