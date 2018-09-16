/* eslint-env jasmine */

describe('ActivitiesCalendar', function () {
  var $componentController, activitiesCalendar;

  beforeEach(module('civicase'));

  beforeEach(inject(function (_$componentController_) {
    $componentController = _$componentController_;
  }));

  beforeEach(function () {
    activitiesCalendar = $componentController('civicaseActivitiesCalendar');
  });

  it('hides the weeks panel from the calendar', function () {
    expect(activitiesCalendar.calendarOptions).toEqual(jasmine.objectContaining({
      showWeeks: false
    }));
  });
});
