/* eslint-env jasmine */
(function ($) {
  describe('DateHelper', function () {
    var DateHelper, activitiesMockData, activity;

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
          activity = activitiesMockData[0];
        });

        describe('when api returns boolean value for is_overdue', function () {
          describe('when is_overdue is true', function () {
            beforeEach(function () {
              activity.is_overdue = true;
            });

            it('returns true if date is overdue', function () {
              expect(DateHelper.isOverdue(activity)).toBe(true);
            });
          });

          describe('when is_overdue is false', function () {
            beforeEach(function () {
              activity.is_overdue = false;
            });

            it('returns false if date is not overdue', function () {
              expect(DateHelper.isOverdue(activity)).toBe(false);
            });
          });
        });

        describe('when api returns string value for is_overdue', function () {
          describe('when is_overdue is true', function () {
            beforeEach(function () {
              activity.is_overdue = '1';
            });

            it('returns true if date is overdue', function () {
              expect(DateHelper.isOverdue(activity)).toBe(true);
            });
          });

          describe('when is_overdue is false', function () {
            beforeEach(function () {
              activity.is_overdue = '0';
            });

            it('returns false if date is not overdue', function () {
              expect(DateHelper.isOverdue(activity)).toBe(false);
            });
          });
        });
      });
    });
  });
}(CRM.$));
