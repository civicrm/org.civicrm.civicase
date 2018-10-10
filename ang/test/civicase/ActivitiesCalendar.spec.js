/* eslint-env jasmine */

(function ($, _, moment) {
  describe('civicaseActivitiesCalendarController', function () {
    var $controller, $scope, $rootScope, activitiesMockData,
      dates, formatActivity, mockCaseId;

    beforeEach(module('civicase', 'civicase.data', 'ui.bootstrap'));

    beforeEach(inject(function (_$controller_, _$rootScope_,
      _activitiesMockData_, datesMockData, _formatActivity_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      activitiesMockData = _activitiesMockData_.get();
      dates = datesMockData;
      formatActivity = _formatActivity_;
    }));

    describe('calendar options', function () {
      beforeEach(function () {
        initController();
      });

      it('hides the weeks panel from the calendar', function () {
        expect($scope.calendarOptions).toEqual(jasmine.objectContaining({
          showWeeks: false
        }));
      });

      it('provides a method to style each calendar day', function () {
        expect(typeof $scope.calendarOptions.customClass).toBe('function');
      });

      it('formats the calendar days using a single digit', function () {
        expect($scope.calendarOptions.formatDay).toBe('d');
      });

      it('starts the week day on Mondays', function () {
        expect($scope.calendarOptions.startingDay).toBe(1);
      });
    });

    describe('calendar days status', function () {
      var customClass;

      describe('when the given calendar mode is for months', function () {
        beforeEach(function () {
          initController();

          customClass = getDayCustomClass(dates.today, 'month');
        });

        it('displays the months as normal without any custom class', function () {
          expect(customClass).toBeUndefined();
        });
      });

      describe('when the given calendar mode is for years', function () {
        beforeEach(function () {
          initController();

          customClass = getDayCustomClass(dates.today, 'year');
        });

        it('displays the years as normal without any custom class', function () {
          expect(customClass).toBeUndefined();
        });
      });

      describe('when all the activities for the current date are completed', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.today, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.today, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.today, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) }
          ];

          initController(activities);

          customClass = getDayCustomClass(dates.today);
        });

        it('marks the day as having completed all of its activities', function () {
          expect(customClass).toBe('civicase__activities-calendar__day-status civicase__activities-calendar__day-status--completed');
        });
      });

      describe('when all the activities for a given date in the past are completed', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.yesterday, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.yesterday, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.yesterday, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) }
          ];

          initController(activities);

          customClass = getDayCustomClass(dates.yesterday);
        });

        it('marks the day as having completed all of its activities', function () {
          expect(customClass).toBe('civicase__activities-calendar__day-status civicase__activities-calendar__day-status--completed');
        });
      });

      describe('when all the activities for a given date in the future are completed', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) }
          ];

          initController(activities);

          customClass = getDayCustomClass(dates.tomorrow);
        });

        it('marks the day as having completed all of its activities', function () {
          expect(customClass).toBe('civicase__activities-calendar__day-status civicase__activities-calendar__day-status--completed');
        });
      });

      describe('when there are no activities for the given date', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.tomorrow },
            { activity_date_time: dates.tomorrow },
            { activity_date_time: dates.tomorrow }
          ];

          initController(activities);

          customClass = getDayCustomClass(dates.today);
        });

        it('displays the day as normal without any status', function () {
          expect(customClass).toBeUndefined();
        });
      });

      describe('when there is at least one activity that is overdue for a given date in the past', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.yesterday, status_id: _.sample(CRM.civicase.activityStatusTypes.completed), is_overdue: false },
            { activity_date_time: dates.yesterday, status_id: _.sample(CRM.civicase.activityStatusTypes.completed), is_overdue: false },
            { activity_date_time: dates.yesterday, status_id: _.sample(CRM.civicase.activityStatusTypes.incomplete), is_overdue: true }
          ];

          initController(activities);

          customClass = getDayCustomClass(dates.yesterday);
        });

        it('marks the day as having overdue activities', function () {
          expect(customClass).toBe('civicase__activities-calendar__day-status civicase__activities-calendar__day-status--overdue');
        });
      });

      describe('when there is at least one activity that is overdue for a given date in the future', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.incomplete) }
          ];

          initController(activities);

          customClass = getDayCustomClass(dates.tomorrow);
        });

        it('marks the day as having scheduled activities', function () {
          expect(customClass).toBe('civicase__activities-calendar__day-status civicase__activities-calendar__day-status--scheduled');
        });
      });

      describe('when there is at least one activity that is overdue for the current date', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.today, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.today, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.today, status_id: _.sample(CRM.civicase.activityStatusTypes.incomplete) }
          ];

          initController(activities);

          customClass = getDayCustomClass(dates.today);
        });

        it('marks the day as having scheduled activities', function () {
          expect(customClass).toBe('civicase__activities-calendar__day-status civicase__activities-calendar__day-status--scheduled');
        });
      });

      describe('when the date is outside this month', function () {
        beforeEach(function () {
          var activities = [
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.completed) },
            { activity_date_time: dates.tomorrow, status_id: _.sample(CRM.civicase.activityStatusTypes.incomplete) }
          ];

          initController(activities);

          customClass = getDayCustomClass(moment(dates.today).add(1, 'month').toDate());
        });

        it('hides the day from the calendar', function () {
          expect(customClass).toBe('invisible');
        });
      });

      /**
       * Simulates a call from the date picker to the `customClass` method.
       * Even if the method is passed from a particular instance, the method
       * gets bound to the date picker, which allows access to some of its internal
       * properties and methods.
       *
       * @param {String|Date} date the current date to use to determine the class.
       * @param {String} mode the current view mode for the calendar. Can be
       *  day, month, or year. Defaults to day.
       * @return {String} the class name.
       */
      function getDayCustomClass (date, mode) {
        var uibDatepicker = {
          datepicker: {
            activeDate: new Date(dates.today)
          }
        };
        date = moment(date).toDate();
        mode = mode || 'day';

        return $scope.calendarOptions.customClass.call(uibDatepicker, { date: date, mode: mode });
      }
    });

    describe('selected activities', function () {
      beforeEach(function () {
        initController();
      });

      describe('when selecting a date with activities included', function () {
        var expectedSelectedActivities;

        beforeEach(function () {
          spyOn($scope, '$emit').and.callThrough();

          expectedSelectedActivities = activitiesMockData
            .filter(function (activity) {
              return moment(activity.activity_date_time).isSame(dates.today, 'day');
            })
            .map(function (activity) {
              return formatActivity(activity, mockCaseId);
            });

          $scope.selectedDate = dates.today;
          $scope.onDateSelected();
        });

        it('only provides the activities for the given date', function () {
          expect($scope.selectedActivites).toEqual(expectedSelectedActivities);
        });

        it('opens the activities popover', function () {
          expect($scope.$emit).toHaveBeenCalledWith('civicaseActivitiesCalendar::openActivitiesPopover');
        });
      });

      describe('when selecting a date with no activities included', function () {
        beforeEach(function () {
          spyOn($scope, '$emit').and.callThrough();

          $scope.selectedDate = dates.nextWeek;
          $scope.onDateSelected();
        });

        it('does not provide any activities for the selected date', function () {
          expect($scope.selectedActivites).toEqual([]);
        });

        it('does not open the activities popover', function () {
          expect($scope.$emit).not.toHaveBeenCalledWith('civicaseActivitiesCalendar::openActivitiesPopover');
        });
      });

      describe('when the activities object is updated', function () {
        beforeEach(function () {
          var mockActivity = _.chain(activitiesMockData).first().clone().value();
          mockActivity.activity_date_time = dates.nextWeek;
          $scope.selectedDate = dates.nextWeek;

          $scope.onDateSelected();

          $scope.activities = [mockActivity];

          $scope.$digest();
        });

        it('updates the selected activities', function () {
          expect($scope.selectedActivites).toEqual($scope.activities);
        });
      });
    });

    /**
     * Initializes the activities calendar component. Passes the given activities
     * as a binding. If no activities are provided it passes an empty array.
     *
     * @param {Array} activities.
     */
    function initController (activities) {
      $scope = $rootScope.$new();
      activities = activities || activitiesMockData;
      mockCaseId = _.uniqueId();

      $scope.activities = activities;
      $scope.caseId = mockCaseId;

      $controller('civicaseActivitiesCalendarController', { $scope: $scope });
    }
  });

  describe('Activities Calendar DOM Events', function () {
    var $compile, $rootScope, $scope, $timeout, $uibPosition, activitiesMockData, activitiesCalendar, datepickerMock;

    beforeEach(module('civicase', 'civicase.data', 'civicase.templates', function ($compileProvider, $provide) {
      $uibPosition = jasmine.createSpyObj('$uibPosition', ['positionElements']);
      datepickerMock = jasmine.createSpyObj('datepicker', ['refreshView']);

      $uibPosition.positionElements.and.returnValue({ top: 0, left: 0 });
      $provide.value('$uibPosition', $uibPosition);
      $provide.decorator('uibDatepickerDirective', function ($delegate) {
        return [{
          restrict: 'A',
          scope: {},
          controller: function ($scope) {
            $scope.datepicker = datepickerMock;
          }
        }];
      });
    }));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _activitiesMockData_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      activitiesMockData = _activitiesMockData_.get();

      $('<div id="bootstrap-theme"></div>').appendTo('body');
    }));

    afterEach(function () {
      activitiesCalendar && activitiesCalendar.remove();
      $('#bootstrap-theme').remove();
      $(document).off('mouseup');
    });

    describe('activities popover', function () {
      beforeEach(function () {
        initDirective();
      });

      describe('when the "open activities popover" event is emitted', function () {
        beforeEach(function () {
          activitiesCalendar.isolateScope().$emit('civicaseActivitiesCalendar::openActivitiesPopover');
          $timeout.flush();
        });

        it('displays the activities popover', function () {
          expect($('.activities-calendar-popover').is(':visible')).toBe(true);
        });
      });

      describe('when the "open activities popover" event is not emitted', function () {
        it('does not display the activities popover', function () {
          expect($('.activities-calendar-popover').is(':visible')).toBe(false);
        });
      });

      describe('closing the popover', function () {
        beforeEach(function () {
          activitiesCalendar.isolateScope().$emit('civicaseActivitiesCalendar::openActivitiesPopover');
          $timeout.flush();
        });

        describe('when clicking outside the popover', function () {
          beforeEach(function () {
            activitiesCalendar.parent().mouseup();
          });

          it('closes the popover', function () {
            expect($('.activities-calendar-popover').is(':visible')).toBe(false);
          });
        });

        describe('when clicking inside the popover', function () {
          beforeEach(function () {
            $('.activities-calendar-popover').mouseup();
          });

          it('does not close the popover', function () {
            expect($('.activities-calendar-popover').is(':visible')).toBe(true);
          });
        });
      });

      describe('opening the popover over the current selected date', function () {
        describe('when opening the popover', function () {
          var activeButton, expectedOffset, popover, jQueryOffsetFn;

          beforeEach(function () {
            var container = $('#bootstrap-theme');
            var mockBodyOffset = { top: 600, left: 500 };
            jQueryOffsetFn = $.fn.offset;

            // Mocking the offset method because the original can fail randomly:
            spyOn($.fn, 'offset').and.returnValue({ top: 200, left: 100 });

            popover = activitiesCalendar.find('.activities-calendar-popover');
            activeButton = activitiesCalendar.find('.uib-day .active');
            expectedOffset = {
              top: mockBodyOffset.top - container.offset().top + 'px',
              left: mockBodyOffset.left - container.offset().left + 'px'
            };

            popover.width(100);
            $uibPosition.positionElements.and.returnValue(mockBodyOffset);
            activitiesCalendar.isolateScope().$emit('civicaseActivitiesCalendar::openActivitiesPopover');
            $timeout.flush();
          });

          afterEach(function () {
            $.fn.offset = jQueryOffsetFn;
          });

          it('appends the popover to the bootstrap theme element', function () {
            expect(popover.parent().is('#bootstrap-theme')).toBe(true);
          });

          it('gets the active element position relative to the body', function () {
            expect($uibPosition.positionElements).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Object), 'bottom', true);
            // this tests that the right elements have been passed to "positionElements":
            expect(activeButton.is($uibPosition.positionElements.calls.mostRecent().args[0])).toEqual(true);
            expect(popover.is($uibPosition.positionElements.calls.mostRecent().args[1])).toEqual(true);
          });

          it('has the same offset as the active day', function () {
            expect(popover.css(['top', 'left']))
              .toEqual(expectedOffset);
          });
        });
      });
    });

    describe('when the activities are updated', function () {
      beforeEach(inject(function (datesMockData) {
        var activities = [
          { activity_date_time: datesMockData.today, status_id: _.sample(CRM.civicase.activityStatusTypes.scheduled) }
        ];

        initDirective(activities);
        datepickerMock.refreshView.calls.reset();

        $scope.activities[0].status_id = _.sample(CRM.civicase.activityStatusTypes.completed);

        $scope.$digest();
      }));

      it('refreshes the datepicker so it displays the new activity statuses', function () {
        expect(datepickerMock.refreshView).toHaveBeenCalledWith();
      });
    });

    /**
     * Appends a mock calendar table element inside the uib-datepicker element.
     */
    function appendMockCalendarTable () {
      var calendarTable = `<table>
        <thead>
          <tr>
            <th><button><i class="glyphicon glyphicon-chevron-left"></i></button></th>
            <th><button class="uib-title"><strong>Month Year</strong></button></th>
            <th><button><i class="glyphicon glyphicon-chevron-right"></i></button></th>
          </tr>
          <tr>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
            <th>Sun</th>
          </tr>
        </thead>
        <tbody>
          <tr class="uib-weeks">
            <td class="uib-day">
              <button><span>06</span></button>
            </td>
            <td class="uib-day">
              <button><span>07</span></button>
            </td>
            <td class="uib-day">
              <button><span>08</span></button>
            </td>
            <td class="uib-day">
              <button class="active"><span>09</span></button>
            </td>
            <td class="uib-day">
              <button><span>10</span></button>
            </td>
            <td class="uib-day">
              <button><span>11</span></button>
            </td>
            <td class="uib-day">
              <button><span>12</span></button>
            </td>
          </tr>
        </tbody>
      </table>`;

      activitiesCalendar.find('[uib-datepicker]').html(calendarTable);
    }

    /**
     * Initializes the activities calendar dom events directive in the context of its
     * parent controller.
     *
     * @param {Array} activities a list of activity objects to pass to the directive's scope.
     *   defaults to all the activities mock data.
     */
    function initDirective (activities) {
      var html = `<civicase-activities-calendar
        activities="activities"
        refresh-callback="refresh">
      </civicase-activities-calendar>`;
      $scope = $rootScope.$new();
      $scope.activities = activities || activitiesMockData;
      $scope.refresh = _.noop;
      activitiesCalendar = $compile(html)($scope);

      activitiesCalendar.appendTo('body');
      $scope.$digest();
      appendMockCalendarTable();
      activitiesCalendar.find('.popover').hide(); // Bootstrap hides this automatically
    }
  });
})(CRM.$, CRM._, moment);
