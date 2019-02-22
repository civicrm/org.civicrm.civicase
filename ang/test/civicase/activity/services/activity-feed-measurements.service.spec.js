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

        topOffset = ActivityFeedMeasurements.getTopOffset();
        expectedTopOffset = CRM.$('.civicase__activity-feed__body').offset().top + 24;
      });

      afterEach(function () {
        removeAdditionalMarkup();
      });

      it('fetches all contacts of the case', function () {
        expect(topOffset).toBe(expectedTopOffset);
      });

      /**
       * Add aditional markup
       */
      function addAdditionalMarkup () {
        var markup = `<div class='civicase__activity-feed__body'></div>`;

        CRM.$(markup).appendTo('body');
      }

      /**
       * Remove aditional markup
       */
      function removeAdditionalMarkup () {
        CRM.$('.civicase__activity-feed__body').remove();
      }
    });
  });
})(CRM._);
