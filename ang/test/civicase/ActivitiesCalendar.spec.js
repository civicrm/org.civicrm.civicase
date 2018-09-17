/* eslint-env jasmine */

(function (moment) {
  describe('ActivitiesCalendar', function () {
    var $componentController, activitiesCalendar, activitiesMockData, dates;

    beforeEach(module('civicase', 'civicase.data'));

    beforeEach(inject(function (_$componentController_, _activitiesMockData_, datesMockData) {
      $componentController = _$componentController_;
      activitiesMockData = _activitiesMockData_.get();
      dates = datesMockData;
    }));

    describe('calendar options', function () {
      beforeEach(function () {
        initComponent();
      });

      it('hides the weeks panel from the calendar', function () {
        expect(activitiesCalendar.calendarOptions).toEqual(jasmine.objectContaining({
          showWeeks: false
        }));
      });
    });

    describe('selected activities', function () {
      beforeEach(function () {
        initComponent();
      });

      describe('when selecting a date with activities included', function () {
        var expectedSelectedActivities;

        beforeEach(function () {
          expectedSelectedActivities = activitiesMockData.filter(function (activity) {
            return moment(activity.activity_date_time).isSame(dates.today, 'day');
          });

          activitiesCalendar.selectedDate = dates.today;
          activitiesCalendar.onDateSelected();
        });

        it('only provides the activities for the given date', function () {
          expect(activitiesCalendar.selectedActivites).toEqual(expectedSelectedActivities);
        });
      });

      describe('when selecting a date with no activities included', function () {
        beforeEach(function () {
          activitiesCalendar.selectedDate = dates.nextWeek;
          activitiesCalendar.onDateSelected();
        });

        it('only provides the activities for the given date', function () {
          expect(activitiesCalendar.selectedActivites).toEqual([]);
        });
      });
    });

    function initComponent (activities) {
      activities = activities || [];

      activitiesCalendar = $componentController('civicaseActivitiesCalendar', null, {
        activities: activitiesMockData
      });
    }
  });
})(moment);
