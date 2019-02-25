/* eslint-env jasmine */
(function (_) {
  describe('ActivityFeedMeasurements', function () {
    var ActivityFeedMeasurements;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_ActivityFeedMeasurements_) {
      ActivityFeedMeasurements = _ActivityFeedMeasurements_;
    }));

    describe('getTopOffset()', function () {
      var topOffset, expectedTopOffset;

      beforeEach(function () {
        addAdditionalMarkup();

        var $feedPanelBody = CRM.$('.civicase__activity-feed>.panel-body');
        var feedPanelBodyPaddingTop = parseInt($feedPanelBody.css('padding-top'));

        topOffset = ActivityFeedMeasurements.getTopOffset();
        expectedTopOffset =
          CRM.$('.civicase__activity-feed__body').offset().top +
          feedPanelBodyPaddingTop;
      });

      afterEach(function () {
        removeAdditionalMarkup();
      });

      it('returns the distance of activity feed body from the top of the screen', function () {
        expect(topOffset).toBe(expectedTopOffset);
      });

      /**
       * Add aditional markup
       */
      function addAdditionalMarkup () {
        var markup = `<div class='civicase__activity-feed'>
          <div class='panel-body' style='padding-top: 24px'>
            <div class='civicase__activity-feed__body'></div>
          </div>
        </div>`;

        CRM.$(markup).appendTo('body');
      }

      /**
       * Remove aditional markup
       */
      function removeAdditionalMarkup () {
        CRM.$('.civicase__activity-feed').remove();
      }
    });
  });
})(CRM._);
