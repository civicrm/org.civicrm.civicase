(function ($, angular) {
  var module = angular.module('civicase');

  module.service('ActivityFeedMeasurements', function () {
    this.getTopOffset = getTopOffset;

    /**
     * Returns the offset from top for the affix functionality
     *
     * @return {Number}
     */
    function getTopOffset () {
      var $feedBody = $('.civicase__activity-feed__body');
      var topOffset = $feedBody.offset().top + 24;

      return topOffset + 24;
    }
  });
})(CRM.$, angular);
