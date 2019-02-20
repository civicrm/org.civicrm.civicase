/* eslint-env jasmine */

(function (_) {
  describe('civicaseActivityMonthNav', function () {
    describe('Activity Month Nav Directive', function () {
      var $compile, $rootScope, $scope, $timeout, heightSpy,
        topOffset, activityMonthNavElement;

      beforeEach(module('civicase', 'civicase.templates'));

      beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;

        $scope = $rootScope.$new();

        heightSpy = spyOn(CRM.$.fn, 'height').and.callThrough();
      }));

      describe('on init', function () {
        var $filter, $toolbarDrawer, $dashboardTabs, $caseBodyTabs;

        afterEach(function () {
          removeAdditionalMarkup();
        });

        describe('when used inside dashboard page', function () {
          beforeEach(function () {
            addAdditionalMarkup(true);
            initDirective();

            $filter = CRM.$('.civicase__activity-filter');
            $toolbarDrawer = CRM.$('#toolbar');
            $dashboardTabs = CRM.$('.civicase__dashboard__tab-container ul.nav');
            $caseBodyTabs = CRM.$('.civicase__case-body_tab');

            $timeout.flush();

            topOffset = $filter.outerHeight() +
              $toolbarDrawer.height() +
              $dashboardTabs.height();
          });

          it('sets the height of the month nav to summation of filter, toolbar and dashboard tab', function () {
            expect(heightSpy.calls.argsFor(2)[0]).toBe('calc(100vh - ' + topOffset + 'px)');
          });
        });

        describe('when used inside case summary page', function () {
          beforeEach(function () {
            addAdditionalMarkup();
            initDirective();

            $filter = CRM.$('.civicase__activity-filter');
            $toolbarDrawer = CRM.$('#toolbar');
            $dashboardTabs = CRM.$('.civicase__dashboard__tab-container ul.nav');
            $caseBodyTabs = CRM.$('.civicase__case-body_tab');

            $timeout.flush();

            topOffset = $filter.outerHeight() +
              $toolbarDrawer.height() +
              $caseBodyTabs.height();
          });

          it('sets the height of the month nav to summation of filter, toolbar and case body tab', function () {
            expect(heightSpy.calls.argsFor(2)[0]).toBe('calc(100vh - ' + topOffset + 'px)');
          });
        });
      });

      describe('when activity panel show/hide', function () {
        beforeEach(function () {
          initDirective();
          $timeout.flush();
        });

        describe('when activity panel is shown', function () {
          describe('and hide-quick-nav-when-details-is-visible property is true', function () {
            beforeEach(function () {
              activityMonthNavElement.isolateScope().hideQuickNavWhenDetailsIsVisible = true;
              $rootScope.$broadcast('civicase::activity-feed::show-activity-panel');
            });

            it('hides the activity nav', function () {
              expect(activityMonthNavElement.isolateScope().isVisible).toBe(false);
            });
          });

          describe('and hide-quick-nav-when-details-is-visible property is false', function () {
            beforeEach(function () {
              activityMonthNavElement.isolateScope().hideQuickNavWhenDetailsIsVisible = false;
              $rootScope.$broadcast('civicase::activity-feed::show-activity-panel');
            });

            it('does not hide the activity nav', function () {
              expect(activityMonthNavElement.isolateScope().isVisible).toBe(true);
            });
          });
        });

        describe('when activity panel is hidden', function () {
          describe('and hide-quick-nav-when-details-is-visible property is true', function () {
            beforeEach(function () {
              activityMonthNavElement.isolateScope().isVisible = false;
              activityMonthNavElement.isolateScope().hideQuickNavWhenDetailsIsVisible = true;
              $rootScope.$broadcast('civicase::activity-feed::hide-activity-panel');
            });

            it('shows the activity nav', function () {
              expect(activityMonthNavElement.isolateScope().isVisible).toBe(true);
            });
          });

          describe('and hide-quick-nav-when-details-is-visible property is false', function () {
            beforeEach(function () {
              activityMonthNavElement.isolateScope().isVisible = false;
              activityMonthNavElement.isolateScope().hideQuickNavWhenDetailsIsVisible = false;
              $rootScope.$broadcast('civicase::activity-feed::hide-activity-panel');
            });

            it('does not show the activity nav', function () {
              expect(activityMonthNavElement.isolateScope().isVisible).toBe(false);
            });
          });
        });
      });

      /**
       * Initializes the civicaseActivityMonthNav directive
       */
      function initDirective () {
        var html = '<div civicase-activity-month-nav></div>';

        activityMonthNavElement = $compile(html)($scope);
        $scope.$digest();
      }

      /**
       * Add aditional markup
       *
       * @param {Boolean} isDashboard
       */
      function addAdditionalMarkup (isDashboard) {
        var markup = `<div id='activity-month-nav-spec-additional-markup'>
        <div class='civicase__activity-filter' style='height: 100px'></div>
        <div id='toolbar' style='height: 200px'></div>
        <div class='civicase__activity-month-nav'></div>
        <div class="civicase__case-body_tab" style='height: 400px'></div>
        </div>`;

        CRM.$(markup).appendTo('body');

        if (isDashboard) {
          markup = `<div class='civicase__dashboard'></div>
            <div class='civicase__dashboard__tab-container'>
              <ul class='nav' style='height: 300px'></ul>
            </div>`;

          CRM.$(markup).appendTo('#activity-month-nav-spec-additional-markup');
        }
      }

      /**
       * Remove aditional markup
       */
      function removeAdditionalMarkup () {
        CRM.$('#activity-month-nav-spec-additional-markup').remove();
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
