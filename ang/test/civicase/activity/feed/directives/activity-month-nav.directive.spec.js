/* eslint-env jasmine */

(function (_) {
  describe('civicaseActivityMonthNav', function () {
    describe('Activity Month Nav Directive', function () {
      var $compile, $rootScope, $scope, $timeout, heightSpy;

      beforeEach(module('civicase', 'civicase.templates'));

      beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;

        $scope = $rootScope.$new();

        heightSpy = spyOn(CRM.$.fn, 'height');
      }));

      describe('on init', function () {
        var heightSpyCallSelectors, expectedHeightSpyCallSelectors;

        beforeEach(function () {
          initDirective(true);
          $timeout.flush();

          heightSpyCallSelectors = _.map(heightSpy.calls.all(), function (callObj) {
            return callObj.object.selector;
          });
          expectedHeightSpyCallSelectors = [
            '#toolbar',
            '.civicase__case-body_tab',
            '.civicase__activity-month-nav',
            '.civicase__dashboard__tab-container ul.nav',
            '.civicase__activity-filter'
          ];
        });

        it('sets the height of the month nav', function () {
          expect(_.union(heightSpyCallSelectors, expectedHeightSpyCallSelectors))
            .toEqual(expectedHeightSpyCallSelectors);
          expect(heightSpy.calls.argsFor(2)[0].startsWith('calc(100vh - ')).toBe(true);
        });
      });

      /**
       * Initializes the civicaseActivityMonthNav directive
       */
      function initDirective (isDashboard) {
        var html = `<div civicase-activity-month-nav></div>
          <div class='civicase__dashboard'></div>
          <div class='civicase__activity-filter'></div>
          <div id='toolbar'></div>
          <div class='civicase__activity-month-nav'></div>
          <div class='civicase__dashboard__tab-container'>
            <ul class='nav'></ul>
          </div>
          <div class="civicase__case-body_tab"></div>`;

        $compile(html)($scope);
        $scope.$digest();
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
