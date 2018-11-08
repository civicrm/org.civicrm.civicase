/* eslint-env jasmine */

(function ($, _, moment) {
  describe('civicaseActivitiesCalendarController', function () {
    var $controller, $q, $scope, $rootScope, crmApi, dates;

    beforeEach(module('civicase', 'crmUtil', 'civicase.data', 'ui.bootstrap'));

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _crmApi_,
      datesMockData) {
      $controller = _$controller_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      crmApi = _crmApi_;

      $scope = $rootScope.$new();
      dates = datesMockData;

      crmApi.and.returnValue($q.resolve({ values: [] }));
    }));

    describe('when uib-datepicker signals that it is ready', function () {
      beforeEach(function () {
        spyOn($scope, '$emit').and.callThrough();

        initController();
        $rootScope.$emit('uibDaypicker::compiled');
      });

      it('starts loading the days with incomplete activities', function () {
        expect(crmApi).toHaveBeenCalledWith('Activity', 'getdayswithactivities', {
          case_id: $scope.caseId,
          status_id: { 'IN': CRM.civicase.activityStatusTypes.incomplete }
        });
      });

      it('does not load the days with complete activities right away', function () {
        expect(crmApi.calls.count()).toBe(1);
      });

      describe('when loading is complete', function () {
        beforeEach(function () {
          crmApi.calls.reset();
          $scope.$digest();
        });

        it('loads the days with complete activities', function () {
          expect(crmApi).toHaveBeenCalledWith('Activity', 'getdayswithactivities', {
            case_id: $scope.caseId,
            status_id: CRM.civicase.activityStatusTypes.completed[0]
          });
        });

        it('has triggered the datepicker refresh twice, one for each request', function () {
          _.times(2, function (i) {
            expect($scope.$emit.calls.argsFor(i)[0]).toBe('civicaseActivitiesCalendar::refreshDatepicker');
          });
        });
      });
    });

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
      var classNameBase = 'civicase__activities-calendar__day-status civicase__activities-calendar__day-status--';

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

      describe('when there are no activities for the given date', function () {
        beforeEach(function () {
          initController();

          customClass = getDayCustomClass(dates.today);
        });

        it('displays the day as normal without any status', function () {
          expect(customClass).toBeUndefined();
        });
      });

      describe('when the date is outside this month', function () {
        beforeEach(function () {
          initController();

          customClass = getDayCustomClass(moment(dates.today).add(1, 'month').toDate());
        });

        it('hides the day from the calendar', function () {
          expect(customClass).toBe('invisible');
        });
      });

      describe('when the given date has all completed activities', function () {
        beforeEach(function () {
          returnDateForStatus(dates.today, 'completed');
          initControllerAndEmitDatepickerReadyEvent();

          customClass = getDayCustomClass(dates.today);
        });

        it('marks the day as having completed all of its activities', function () {
          expect(customClass).toBe(classNameBase + 'completed');
        });
      });

      describe('when the given date has incompleted activities', function () {
        describe('when the date is not in the past yet', function () {
          beforeEach(function () {
            returnDateForStatus(dates.tomorrow, 'incomplete');
            initControllerAndEmitDatepickerReadyEvent();

            customClass = getDayCustomClass(dates.tomorrow);
          });

          it('marks the day as having scheduled activities', function () {
            expect(customClass).toBe(classNameBase + 'scheduled');
          });
        });

        describe('when the date is already in the past', function () {
          beforeEach(function () {
            returnDateForStatus(dates.yesterday, 'incomplete');
            initControllerAndEmitDatepickerReadyEvent();

            customClass = getDayCustomClass(dates.yesterday);
          });

          it('marks the day as having scheduled activities', function () {
            expect(customClass).toBe(classNameBase + 'overdue');
          });
        });

        describe('when the given date has both completed and incompleted activities', function () {
          beforeEach(function () {
            returnDateForStatus(dates.today, 'any');
            initControllerAndEmitDatepickerReadyEvent();

            customClass = getDayCustomClass(dates.today);
          });

          it('does not mark the day as having completed all of its activities', function () {
            expect(customClass).toBe(classNameBase + 'overdue');
          });
        });
      });

      /**
       * initializes the controller and simulates the event that the
       * decorated uib-datepicker sends when it's compiled and attached to the DOM
       */
      function initControllerAndEmitDatepickerReadyEvent () {
        initController();
        $rootScope.$emit('uibDaypicker::compiled');
        $scope.$digest();
      }

      /**
       * It returns the given date as part of the response of
       * the Activity.getdayswithactivities endpoint call for the given status type
       *
       * @param {String} date formatted in local time
       * @param {String} status any|completed|incomplete
       */
      function returnDateForStatus (date, status) {
        crmApi.and.callFake(function (entity, action, params) {
          var dates = [];
          var isCompleteActivitiesApiCall = params.status_id === CRM.civicase.activityStatusTypes.completed[0];
          var isIncompleteActivitiesApiCall = _.isEqual(params.status_id.IN, CRM.civicase.activityStatusTypes.incomplete);

          if (status === 'any' ||
            (status === 'completed' && isCompleteActivitiesApiCall) ||
            (status === 'incomplete' && isIncompleteActivitiesApiCall)) {
            dates = [ moment(date).format('YYYY-MM-DD') ];
          }

          return $q.resolve({ values: dates });
        });
      }

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
    });

    /**
     * Initializes the activities calendar component
     */
    function initController () {
      $scope.caseId = _.uniqueId();

      $controller('civicaseActivitiesCalendarController', { $scope: $scope });
    }
  });

  describe('Activities Calendar DOM Events', function () {
    var $compile, $q, $rootScope, $scope, $timeout, $uibPosition, activitiesCalendar,
      crmApi, datepickerMock;

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

    beforeEach(inject(function (_$compile_, _$q_, _$rootScope_, _$timeout_, _crmApi_) {
      $compile = _$compile_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      crmApi = _crmApi_;

      crmApi.and.returnValue($q.resolve({ values: [] }));

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
        refresh-callback="refresh">
      </civicase-activities-calendar>`;
      $scope = $rootScope.$new();
      $scope.refresh = _.noop;
      activitiesCalendar = $compile(html)($scope);

      activitiesCalendar.appendTo('body');
      $scope.$digest();
      appendMockCalendarTable();
      activitiesCalendar.find('.popover').hide(); // Bootstrap hides this automatically
    }
  });
})(CRM.$, CRM._, moment);
