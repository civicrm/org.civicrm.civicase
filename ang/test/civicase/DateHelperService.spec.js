/* eslint-env jasmine */
(function ($) {
  describe('DateHelper', function () {
    var DateHelper, pastDate, futureDate;

    beforeEach(module('civicase'));

    describe('DateHelper', function () {
      beforeEach(inject(function (_DateHelper_) {
        DateHelper = _DateHelper_;
      }));

      describe('formatDate()', function () {
        it('returns the date in the DD/MM/YYYY format', function () {
          expect(DateHelper.formatDate('2017-11-20 00:00:00', 'DD/MM/YYYY')).toBe('20/11/2017');
        });
      });

      describe('isOverdue()', function () {
        beforeEach(function () {
          pastDate = moment().subtract(7, 'd');
          futureDate = moment().add(7, 'd');
        });

        it('returns true when date is in past', function () {
          expect(DateHelper.isOverdue(pastDate)).toBe(true);
        });

        it('returns false when date is not in past', function () {
          expect(DateHelper.isOverdue(futureDate)).toBe(false);
        });
      });
    });
  });
}(CRM.$));
