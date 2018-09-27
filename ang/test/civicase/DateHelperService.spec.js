/* eslint-env jasmine */
(function ($) {
  describe('DateHelper', function () {
    var DateHelper, activitiesMockData, activitiyWithStringOverdue, activitiyWithBooleanOverdue, activitiyWithoutOverdue;

    beforeEach(module('civicase', 'civicase.data'));

    describe('DateHelper', function () {
      beforeEach(inject(function (_DateHelper_, _activitiesMockData_) {
        DateHelper = _DateHelper_;
        activitiesMockData = _activitiesMockData_.get();
      }));

      describe('formatDate()', function () {
        it('returns the date in the DD/MM/YYYY format', function () {
          expect(DateHelper.formatDate('2017-11-20 00:00:00', 'DD/MM/YYYY')).toBe('20/11/2017');
        });
      });

      describe('isOverdue()', function () {
        beforeEach(function () {
          activitiyWithBooleanOverdue = activitiesMockData[0];
          activitiyWithBooleanOverdue.is_overdue = true;

          activitiyWithStringOverdue = activitiesMockData[0];
          activitiyWithStringOverdue.is_overdue = '1';

          activitiyWithoutOverdue = activitiesMockData[0];
          delete (activitiyWithoutOverdue.is_overdue);
        });

        it('returns true is_overdue is boolean', function () {
          expect(DateHelper.isOverdue(activitiyWithBooleanOverdue)).toBe(true);
        });

        it('returns true is_overdue is String', function () {
          expect(DateHelper.isOverdue(activitiyWithStringOverdue)).toBe(true);
        });

        it('is not undefined when is_overdue is not present', function () {
          expect(DateHelper.isOverdue(activitiyWithStringOverdue)).toBeDefined();
        });
      });
    });
  });
}(CRM.$));
