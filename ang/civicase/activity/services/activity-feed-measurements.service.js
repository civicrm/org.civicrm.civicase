(function ($, _, angular) {
  var module = angular.module('civicase');

  module.service('ActivityFeedMeasurements', function () {
    this.setHeightOf = setHeightOf;

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

    /**
     * Returns the collective height of all contact tab children
     *
     * @return {Number}
     */
    function civicrmContactTabHeight () {
      var height = 0;
      var $civicrmContactTabChildren = $('.crm-contact-tabs-list').children();

      _.each($civicrmContactTabChildren, function (child) {
        height += $(child).height();
      });

      return height;
    }

    /**
     * Set height of the sent element for scrolling
     *
     * @param {Object} $elm
     * @return {Number}
     */
    function setHeightOf ($elm) {
      var $civicrmContactTabs = $('.crm-contact-tabs-list');

      if ($civicrmContactTabs.length) {
        var height = civicrmContactTabHeight() +
          $civicrmContactTabs.offset().top - getTopOffset();
        $elm.height(height);
      } else {
        $elm.height('calc(100vh - ' + getTopOffset() + 'px)');
      }
    }
  });
})(CRM.$, CRM._, angular);
