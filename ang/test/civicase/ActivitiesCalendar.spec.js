/* eslint-env jasmine */

(function (moment) {
  describe('ActivitiesCalendar', function () {
    var $componentController, $scope, $rootScope, activitiesCalendar, activitiesMockData,
      dates;

    beforeEach(module('civicase', 'civicase.data'));

    beforeEach(inject(function (_$componentController_, _$rootScope_,
      _activitiesMockData_, datesMockData) {
      $componentController = _$componentController_;
      $rootScope = _$rootScope_;
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
          spyOn($scope, '$emit').and.callThrough();

          expectedSelectedActivities = activitiesMockData.filter(function (activity) {
            return moment(activity.activity_date_time).isSame(dates.today, 'day');
          });

          activitiesCalendar.selectedDate = dates.today;
          activitiesCalendar.onDateSelected();
        });

        it('only provides the activities for the given date', function () {
          expect(activitiesCalendar.selectedActivites).toEqual(expectedSelectedActivities);
        });

        it('emits an "open activities popover" event', function () {
          expect($scope.$emit).toHaveBeenCalledWith('civicaseActivitiesCalendar::openActivitiesPopover');
        });
      });

      describe('when selecting a date with no activities included', function () {
        beforeEach(function () {
          spyOn($scope, '$emit').and.callThrough();

          activitiesCalendar.selectedDate = dates.nextWeek;
          activitiesCalendar.onDateSelected();
        });

        it('only provides the activities for the given date', function () {
          expect(activitiesCalendar.selectedActivites).toEqual([]);
        });

        it('does not not emit the "open activities popover" event', function () {
          expect($scope.$emit).not.toHaveBeenCalledWith('civicaseActivitiesCalendar::openActivitiesPopover');
        });
      });
    });

    /**
     * Initializes the activities calendar component. Passes the given activities
     * as a binding. If no activities are provided it passes an empty array.
     *
     * @param {Array} activities.
     */
    function initComponent (activities) {
      $scope = $rootScope.$new();
      activities = activities || [];

      activitiesCalendar = $componentController('civicaseActivitiesCalendar',
        { $scope: $scope },
        { activities: activitiesMockData }
      );
    }
  });

  describe('Activities Calendar DOM Events', function () {
    var $compile, $rootScope, $scope, activitiesMockData, activitiesCalendar;

    beforeEach(module('civicase', 'civicase.data', 'civicase.templates'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _activitiesMockData_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      activitiesMockData = _activitiesMockData_.get();
    }));

    afterEach(function () {
      activitiesCalendar && activitiesCalendar.remove();
    });

    describe('activities popover', function () {
      beforeEach(function () {
        initDirective();
      });

      describe('when the "open activities popover" event is emitted', function () {
        beforeEach(function () {
          activitiesCalendar.isolateScope().$emit('civicaseActivitiesCalendar::openActivitiesPopover');
        });

        it('displays the activities popover', function () {
          expect(activitiesCalendar.find('.activities-calendar-popover').is(':visible')).toBe(true);
        });
      });

      describe('when the "open activities popover" event is not emitted', function () {
        it('does not display the activities popover', function () {
          expect(activitiesCalendar.find('.activities-calendar-popover').is(':visible')).toBe(false);
        });
      });

      describe('closing the popover', function () {
        beforeEach(function () {
          activitiesCalendar.isolateScope().$emit('civicaseActivitiesCalendar::openActivitiesPopover');
        });

        describe('when clicking outside the popover', function () {
          beforeEach(function () {
            activitiesCalendar.parent().mouseup();
          });

          it('closes the popover', function () {
            expect(activitiesCalendar.find('.activities-calendar-popover').is(':visible')).toBe(false);
          });
        });

        describe('when clicking inside the popover', function () {
          beforeEach(function () {
            activitiesCalendar.find('.activities-calendar-popover').mouseup();
          });

          it('does not close the popover', function () {
            expect(activitiesCalendar.find('.activities-calendar-popover').is(':visible')).toBe(true);
          });
        });
      });
    });

    /**
     * Initializes the activities calendar dom events directive in the context of its
     * parent controller.
     */
    function initDirective () {
      var html = '<civicase-activities-calendar activities="activities"></civicase-activities-calendar>';
      $scope = $rootScope.$new();
      $scope.activities = activitiesMockData;
      activitiesCalendar = $compile(html)($scope);

      activitiesCalendar.appendTo('body');
      $scope.$digest();
      activitiesCalendar.find('.popover').hide(); // Bootstrap hides this automatically
    }
  });
})(moment);
