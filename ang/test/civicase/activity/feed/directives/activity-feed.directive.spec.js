/* eslint-env jasmine */

(function (_) {
  describe('civicaseActivityFeed', function () {
    describe('Activity Feed Controller', function () {
      var $provide, $controller, $rootScope, $scope, $q, crmApi, CaseTypes, activitiesMockData;
      var activitiesInCurrentPage, allActivities;

      beforeEach(module('civicase', 'civicase.data', function (_$provide_) {
        $provide = _$provide_;
      }));

      beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, _CaseTypes_, _crmApi_, _activitiesMockData_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        CaseTypes = _CaseTypes_;
        activitiesMockData = _activitiesMockData_;

        $scope = $rootScope.$new();
        $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');
        crmApi = _crmApi_;
      }));

      describe('loadActivities', function () {
        beforeEach(function () {
          activitiesInCurrentPage = [];
          allActivities = [];

          mockActivitiesAPICall();
          initController();

          $scope.filters.activitySet = CaseTypes.get()['1'].definition.activitySets[0].name;
          $scope.filters.activity_type_id = '5';
        });

        describe('when filtered by activity set and activity id', function () {
          var expectedActivityTypeIDs;

          beforeEach(function () {
            expectedActivityTypeIDs = [];
            $scope.$digest();

            _.each(CaseTypes.get()['1'].definition.activitySets[0].activityTypes, function (activityTypeFromSet) {
              expectedActivityTypeIDs.push(_.findKey(CRM.civicase.activityTypes, function (activitySet) {
                return activitySet.name === activityTypeFromSet.name;
              }));
            });
            expectedActivityTypeIDs.push($scope.filters.activity_type_id);
          });

          it('requests the activities using the "get" api action', function () {
            expect(crmApi).toHaveBeenCalledWith({
              acts: ['Activity', 'get', jasmine.any(Object)],
              all: ['Activity', 'get', jasmine.any(Object)]
            });
          });

          it('filters by the activities of the selected activity set and the activity id', function () {
            var args = crmApi.calls.mostRecent().args[0].acts[2].activity_type_id;
            expect(args).toEqual({ IN: expectedActivityTypeIDs });
          });
        });

        describe('when filtered by "My Activities"', function () {
          beforeEach(function () {
            $scope.filters['@involvingContact'] = 'myActivities';

            $scope.$digest();
          });

          it('requests the activities using the "get contact activities" api action', function () {
            expect(crmApi).toHaveBeenCalledWith({
              acts: ['Activity', 'getcontactactivities', jasmine.any(Object)],
              all: ['Activity', 'getcontactactivities', jasmine.any(Object)]
            });
          });
        });
      });

      describe('checkIfRecordsAvailableOnDirection()', function () {
        describe('when total count of activities is 0', function () {
          beforeEach(function () {
            activitiesInCurrentPage = [];
            allActivities = [];
            mockActivitiesAPICall();
            initController();
            $scope.$digest();
          });

          it('does not show load more button', function () {
            expect($scope.checkIfRecordsAvailableOnDirection()).toBe(false);
          });
        });

        describe('when total count of activities is more than 0', function () {
          describe('starting offset is 0', function () {
            describe('and less than 25', function () {
              beforeEach(function () {
                activitiesInCurrentPage = activitiesMockData.getSentNoOfActivities(20);
                allActivities = activitiesMockData.getSentNoOfActivities(20);
                mockActivitiesAPICall();
                initController();
                $scope.$digest();

                $scope.$emit('civicase::month-nav::clicked', {
                  startingOffset: 0
                });
                $scope.$digest();
              });

              it('does not show load more button on down direction', function () {
                expect($scope.checkIfRecordsAvailableOnDirection('down')).toBe(false);
              });

              it('does not show load more button on top direction', function () {
                expect($scope.checkIfRecordsAvailableOnDirection('up')).toBe(false);
              });
            });
            describe('and more than 25', function () {
              beforeEach(function () {
                activitiesInCurrentPage = activitiesMockData.getSentNoOfActivities(30);
                allActivities = activitiesMockData.getSentNoOfActivities(30);
                mockActivitiesAPICall();
                initController();
                $scope.$digest();

                $scope.$emit('civicase::month-nav::clicked', {
                  startingOffset: 0
                });
                $scope.$digest();
              });

              it('does shows load more button on down direction', function () {
                expect($scope.checkIfRecordsAvailableOnDirection('down')).toBe(true);
              });

              it('does not show load more button on top direction', function () {
                expect($scope.checkIfRecordsAvailableOnDirection('up')).toBe(false);
              });
            });
          });

          describe('starting offset is between 0 and total number of records', function () {
            beforeEach(function () {
              activitiesInCurrentPage = activitiesMockData.getSentNoOfActivities(60);
              allActivities = activitiesMockData.getSentNoOfActivities(60);
              mockActivitiesAPICall();
              initController();
              $scope.$digest();

              $scope.$emit('civicase::month-nav::clicked', {
                startingOffset: 30
              });
              $scope.$digest();
            });

            it('does not show load more button on down direction', function () {
              expect($scope.checkIfRecordsAvailableOnDirection('down')).toBe(true);
            });

            it('does not show load more button on top direction', function () {
              expect($scope.checkIfRecordsAvailableOnDirection('up')).toBe(true);
            });
          });
        });
      });

      describe('when clicking load more button', function () {
        beforeEach(function () {
          activitiesInCurrentPage = activitiesMockData.getSentNoOfActivities(25);
          allActivities = activitiesMockData.getSentNoOfActivities(26);

          mockActivitiesAPICall();
          initController();
          $scope.$digest();

          activitiesInCurrentPage = activitiesMockData.getSentNoOfActivities(1);
          activitiesInCurrentPage[0].subject = 'custom text';
        });

        describe('nextPage()', function () {
          beforeEach(function () {
            $scope.nextPage();
            $scope.$digest();
          });

          it('appends new activties to the end of previous activities', function () {
            expect($scope.activities[25].subject).toBe('custom text');
          });
        });

        describe('previousPage()', function () {
          beforeEach(function () {
            $scope.previousPage();
            $scope.$digest();
          });

          it('appends new activties to the beginning of previous activities', function () {
            expect($scope.activities[0].subject).toBe('custom text');
          });
        });
      });

      describe('when clicked on a month nav and data for that month' +
       'is not rendered on the screen', function () {
        beforeEach(function () {
          activitiesInCurrentPage = activitiesMockData.getSentNoOfActivities(60);
          allActivities = activitiesMockData.getSentNoOfActivities(60);
          mockActivitiesAPICall();

          initController();
          $scope.$digest();

          $scope.$emit('civicase::month-nav::clicked', {
            startingOffset: 10
          });
          $scope.$digest();
        });

        it('shows records starting from the clicked month', function () {
          expect(crmApi).toHaveBeenCalledWith(jasmine.objectContaining({
            acts: ['Activity', 'get', jasmine.objectContaining({
              options: jasmine.objectContaining({
                offset: 10
              })
            })]
          }));
        });
      });

      /**
       * Mocks Activities API calls
       */
      function mockActivitiesAPICall () {
        crmApi.and.returnValue($q.resolve({
          acts: {values: activitiesInCurrentPage},
          all: {values: allActivities}
        }));

        $provide.factory('crmThrottle', function () {
          var crmThrottle = jasmine.createSpy('crmThrottle');

          crmThrottle.and.callFake(function (callable) {
            callable();

            return $q.resolve([{
              acts: { values: activitiesInCurrentPage },
              all: { values: allActivities }
            }]);
          });

          return crmThrottle;
        });
      }

      /**
       * Initializes the activity feed controller.
       */
      function initController () {
        $scope.caseTypeId = '1';
        $scope.filters = {};
        $scope.displayOptions = {};
        $scope.params = {
          displayOptions: 1
        };

        $controller('civicaseActivityFeedController', {
          $scope: $scope
        });
      }
    });
  });

  describe('civicaseActivityDetailsAffix', function () {
    var element, $compile, $document, $rootScope, scope, affixReturnValue, affixOriginalFunction;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _$document_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      scope = $rootScope.$new();
      $document = _$document_;
    }));

    beforeEach(function () {
      compileDirective();
    });

    beforeEach(function () {
      affixOriginalFunction = CRM.$.fn.affix;
      CRM.$.fn.affix = jasmine.createSpy('affix');
      affixReturnValue = jasmine.createSpyObj('affix', ['on']);
      affixReturnValue.on.and.returnValue(affixReturnValue);
      CRM.$.fn.affix.and.returnValue(affixReturnValue);
    });

    afterEach(function () {
      CRM.$.fn.affix = affixOriginalFunction;

      removeTestDomElements();
    });

    describe('when initialised', function () {
      var $activityDetailsPanel, $filter, $feedListContainer, $tabs, $toolbarDrawer;

      beforeEach(function () {
        $filter = CRM.$('.civicase__activity-filter');
        $feedListContainer = CRM.$('.civicase__activity-feed__body');
        $tabs = CRM.$('.civicase__dashboard').length > 0 ? CRM.$('.civicase__dashboard__tab-container ul.nav') : CRM.$('.civicase__case-body_tab');
        $toolbarDrawer = CRM.$('#toolbar');

        compileDirective();
        $activityDetailsPanel = element.find('.civicase__activity-panel');
      });

      afterEach(function () {
        removeTestDomElements();
      });

      it('applies static positioning to the activity details', function () {
        expect(element.find('.civicase__activity-panel').affix).toHaveBeenCalledWith({
          offset: {
            top: $activityDetailsPanel.offset().top - ($toolbarDrawer.height() + $tabs.height() + $filter.outerHeight()),
            bottom: CRM.$($document).height() - ($feedListContainer.offset().top + $feedListContainer.height())
          }
        });
      });

      describe('when the activity details panel is iniliased with window already scrolled', function () {
        beforeEach(function () {
          compileDirective({isAffixedOnInit: true});

          $activityDetailsPanel = element.find('.civicase__activity-panel');
        });

        afterEach(function () {
          removeTestDomElements();
        });

        it('sets the top positioning', function () {
          expect($activityDetailsPanel.css('top')).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()) + 'px');
        });

        it('sets the width', function () {
          expect($activityDetailsPanel.width()).toBe(element.width());
        });
      });
    });

    describe('when static positioning is applied to the Activity Panel', function () {
      var $activityDetailsPanel, $filter, $tabs, $toolbarDrawer;

      beforeEach(function () {
        $activityDetailsPanel = element.find('.civicase__activity-panel');
        $filter = CRM.$('.civicase__activity-filter');
        $tabs = CRM.$('.civicase__dashboard').length > 0 ? CRM.$('.civicase__dashboard__tab-container ul.nav') : CRM.$('.civicase__case-body_tab');
        $toolbarDrawer = CRM.$('#toolbar');

        $activityDetailsPanel.trigger('affixed.bs.affix');
      });

      it('sets the top positioning', function () {
        expect($activityDetailsPanel.css('top')).toBe(($toolbarDrawer.height() + $tabs.height() + $filter.height()) + 'px');
      });

      it('sets the width', function () {
        expect($activityDetailsPanel.width()).toBe(element.width());
      });
    });

    describe('when static positioning is removed to the Activity Panel', function () {
      var $activityDetailsPanel;

      beforeEach(function () {
        $activityDetailsPanel = element.find('.civicase__activity-panel');

        $activityDetailsPanel.trigger('affixed-top.bs.affix');
      });

      it('resets the top positioning', function () {
        expect($activityDetailsPanel.css('top')).toBe('auto');
      });

      it('resets the width', function () {
        expect($activityDetailsPanel.width()).toBe(0);
      });
    });

    /**
     * Compiles the directive and appends test DOM elements to the body.
     *
     * @param {Object} options
     */
    function compileDirective (options) {
      options = options || {};
      var activityDetailsPanel = angular.element('<div civicase-activity-details-affix><div class="civicase__activity-panel"></div></div>');

      CRM.$('<div class="civicase__activity-feed__body"></div>').appendTo('body');
      CRM.$('<div class="civicase__activity-filter"></div>').appendTo('body');
      CRM.$('<div id="toolbar"></div>').appendTo('body');

      if (options.isAffixedOnInit) {
        activityDetailsPanel.find('.civicase__activity-panel').addClass('affix');
      }

      element = $compile(activityDetailsPanel)(scope);
    }

    /**
     * Removes DOM elements added for testing purposes.
     */
    function removeTestDomElements () {
      CRM.$('.civicase__activity-feed__body').remove();
      CRM.$('.civicase__activity-filter').remove();
      CRM.$('#toolbar').remove();
    }
  });
})(CRM._);
