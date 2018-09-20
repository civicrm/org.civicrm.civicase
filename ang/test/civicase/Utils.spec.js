/* eslint-env jasmine */
(function ($) {
  describe('Utils', function () {
    var DateHelper, pastDate, futureDate;

    beforeEach(module('civicase'));

    describe('DateHelper', function () {
      beforeEach(inject(function (_DateHelper_) {
        DateHelper = _DateHelper_;
      }));

      describe('formatDate()', function () {
        it('checks the format of the date', function () {
          expect(DateHelper.formatDate('2017-11-20 00:00:00', 'DD/MM/YYYY')).toBe('20/11/2017');
        });
      });

      describe('isOverdue()', function () {
        beforeEach(function () {
          pastDate = moment().subtract(7, 'd');
          futureDate = moment().add(7, 'd');
        });

        it('checks the date is overdue ', function () {
          expect(DateHelper.isOverdue(pastDate)).toBe(true);
        });

        it('checks the date is not overdue ', function () {
          expect(DateHelper.isOverdue(futureDate)).toBe(false);
        });
      });
    });
  });
}(CRM.$));
