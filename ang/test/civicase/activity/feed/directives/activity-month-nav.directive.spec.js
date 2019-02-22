/* eslint-env jasmine */

(function (_) {
  describe('civicaseActivityMonthNav', function () {
    describe('Activity Month Nav Directive', function () {
      var $compile, $rootScope, $scope, $timeout,
        ActivityFeedMeasurements;

      beforeEach(module('civicase', 'civicase.templates'));

      beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_,
        _ActivityFeedMeasurements_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        ActivityFeedMeasurements = _ActivityFeedMeasurements_;

        $scope = $rootScope.$new();
      }));

      describe('on init', function () {
        beforeEach(function () {
          addAdditionalMarkup();
        });

        afterEach(function () {
          removeAdditionalMarkup();
        });

        describe('height of month nav', function () {
          beforeEach(function () {
            spyOn(ActivityFeedMeasurements, 'getTopOffset').and.returnValue(10);
            spyOn(CRM.$.fn, 'height');
            initDirective();

            $timeout.flush();
          });

          it('sets the height of the month nav', function () {
            // in this case as `calc` is used, height cannot be tested
            // by getting the actual height of the element,
            // instead checking whether the height function is called
            expect(CRM.$.fn.height).toHaveBeenCalledWith('calc(100vh - ' + 10 + 'px)');
          });
        });
      });

      /**
       * Initializes the civicaseActivityMonthNav directive
       */
      function initDirective () {
        var html = `<div civicase-activity-month-nav></div>`;

        $compile(html)($scope);
        $scope.$digest();
      }

      /**
       * Add aditional markup
       */
      function addAdditionalMarkup () {
        var markup = `<div class='civicase__activity-feed__body__month-nav'></div>`;

        CRM.$(markup).appendTo('body');
      }

      /**
       * Remove aditional markup
       */
      function removeAdditionalMarkup () {
        CRM.$('.civicase__activity-feed__body__month-nav').remove();
      }
    });

    describe('Activity Month Nav Controller', function () {
      var $scope, $controller, $rootScope, crmApi, $q, monthNavMockData;

      beforeEach(module('civicase', 'civicase.data'));

      beforeEach(inject(function (_$controller_, _$rootScope_, _crmApi_, _$q_, _monthNavMockData_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        monthNavMockData = _monthNavMockData_;

        $scope = $rootScope.$new();
        crmApi = _crmApi_;
      }));

      describe('when activity feed has loaded all records', function () {
        var monthData;

        describe('when overdue first option is disabled', function () {
          beforeEach(function () {
            var params = {};
            var overdueFirst = false;
            monthData = monthNavMockData.get();

            crmApi.and.returnValue($q.resolve({
              months: { values: monthData }
            }));

            initController();
            $scope.$emit('civicaseActivityFeed.query', {}, params, false, overdueFirst);
            $scope.$digest();
          });

          it('shows the future months', function () {
            expect($scope.groups[0]).toEqual({
              groupName: 'future',
              records: [{
                year: monthData[0].year,
                months: [{
                  count: monthData[0].count,
                  isOverDueGroup: false,
                  month: monthData[0].month,
                  year: monthData[0].year,
                  monthName: moment().set('month', monthData[0].month - 1).format('MMMM'),
                  startingOffset: 0
                }]
              }]
            });
          });

          it('shows the now months', function () {
            expect($scope.groups[1]).toEqual(
              {
                groupName: 'now',
                records: [{
                  year: monthData[1].year,
                  months: [{
                    count: monthData[1].count,
                    isOverDueGroup: false,
                    month: monthData[1].month,
                    year: monthData[0].year,
                    monthName: moment().set('month', monthData[1].month - 1).format('MMMM'),
                    startingOffset: monthData[0].count
                  }]
                }]
              });
          });

          it('shows the past months', function () {
            expect($scope.groups[2]).toEqual(
              {
                groupName: 'past',
                records: [{
                  year: monthData[2].year,
                  months: [{
                    count: monthData[2].count,
                    isOverDueGroup: false,
                    month: monthData[2].month,
                    year: monthData[2].year,
                    monthName: moment().set('month', monthData[2].month - 1).format('MMMM'),
                    startingOffset: monthData[0].count + monthData[1].count
                  }]
                }]
              });
          });
        });

        describe('when overdue first option is enabled', function () {
          beforeEach(function () {
            var params = {};
            var overdueFirst = true;
            monthData = monthNavMockData.get();

            crmApi.and.returnValue($q.resolve({
              months_with_overdue: { values: monthData },
              months_wo_overdue: { values: [] }
            }));

            initController();
            $scope.$emit('civicaseActivityFeed.query', {}, params, false, overdueFirst);
            $scope.$digest();
          });

          it('shows the overdue months grouped by year', function () {
            expect($scope.groups).toEqual([
              {
                groupName: 'overdue',
                records: [{
                  year: monthData[0].year,
                  months: [{
                    count: monthData[0].count,
                    isOverDueGroup: true,
                    month: monthData[0].month,
                    year: monthData[0].year,
                    monthName: moment().set('month', monthData[0].month - 1).format('MMMM'),
                    startingOffset: 0
                  }, {
                    count: monthData[1].count,
                    isOverDueGroup: true,
                    month: monthData[1].month,
                    year: monthData[1].year,
                    monthName: moment().set('month', monthData[1].month - 1).format('MMMM'),
                    startingOffset: monthData[0].count
                  }, {
                    count: monthData[2].count,
                    isOverDueGroup: true,
                    month: monthData[2].month,
                    year: monthData[2].year,
                    monthName: moment().set('month', monthData[2].month - 1).format('MMMM'),
                    startingOffset: monthData[0].count + monthData[1].count
                  }]
                }]
              }]);
          });
        });
      });

      /**
       * Initializes the month nav controller.
       */
      function initController () {
        $controller('civicaseActivityMonthNavController', {
          $scope: $scope
        });
      }
    });
  });
})(CRM._);
