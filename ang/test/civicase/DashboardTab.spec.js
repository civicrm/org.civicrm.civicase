/* eslint-env jasmine */
(function ($, _, moment) {
  describe('dashboardTabController', function () {
    var $controller, $rootScope, $scope, formatActivity, formatActivityMock,
      formatCase, formatCaseMock;

    beforeEach(module('civicase.templates', 'civicase', 'crmUtil'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _formatActivity_, _formatCase_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      formatActivity = _formatActivity_;
      formatCase = _formatCase_;
      $scope = $rootScope.$new();

      $scope.filters = { caseRelationshipType: 'all' };
      $scope.activityFilters = {
        case_filter: { foo: 'foo' }
      };

      mockFormatFunctions();
      initController();
    }));

    describe('panel-query panel: new cases', function () {
      it('is defined', function () {
        expect($scope.newCasesPanel).toBeDefined();
      });

      describe('query', function () {
        it('is defined', function () {
          expect($scope.newCasesPanel.query).toBeDefined();
        });

        it('is for the Case entity', function () {
          expect($scope.newCasesPanel.query.entity).toBe('Case');
        });

        it('is calls the getcaselist endpoint', function () {
          expect($scope.newCasesPanel.query.action).toBe('getcaselist');
        });

        it('adds the params defined in the relationship filter', function () {
          expect($scope.newCasesPanel.query.params)
            .toEqual(jasmine.objectContaining($scope.activityFilters.case_filter));
        });

        it('fetches only the cases with the "Opened" class', function () {
          expect($scope.newCasesPanel.query.params['status_id.grouping']).toBe('Opened');
        });

        it('sorts by start_date, descending order', function () {
          expect($scope.newCasesPanel.query.params.options.sort).toBe('start_date DESC');
        });
      });

      describe('handlers', function () {
        describe('results handler', function () {
          var mockedResults = mockResults('contacts');

          it('is defined', function () {
            expect($scope.newCasesPanel.handlers.results).toBeDefined();
          });

          describe('when invoked', function () {
            var contactsCount, ContactsDataService;

            beforeEach(inject(function (_ContactsDataService_) {
              ContactsDataService = _ContactsDataService_;
            }));

            beforeEach(function () {
              spyOn(ContactsDataService, 'add');

              contactsCount = countTotalAndUniqueContactIds(mockedResults, 'contacts');
              $scope.newCasesPanel.handlers.results(mockedResults);
            });

            it('calls the formatCase service on each result item', function () {
              expect(formatCaseMock.calls.count()).toBe(mockedResults.length);
            });

            it('calls ContactsDataService.add() with a duplicate-free list of the results\'s contacts', function () {
              var contactIds = ContactsDataService.add.calls.argsFor(0)[0];

              expect(ContactsDataService.add).toHaveBeenCalled();
              expect(contactIds).not.toEqual(contactsCount.total);
              expect(contactIds).toEqual(contactsCount.uniq);
            });
          });
        });

        describe('range handler', function () {
          it('is defined', function () {
            expect($scope.newCasesPanel.handlers.range).toBeDefined();
          });

          describe('when invoked', function () {
            describe('when the week range is selected', function () {
              beforeEach(function () {
                $scope.newCasesPanel.handlers.range('week', $scope.newCasesPanel.query.params);
              });

              it('filters by `start_date` between start and end of the current week', function () {
                expect($scope.newCasesPanel.query.params.start_date).toBeDefined();
                expect($scope.newCasesPanel.query.params.start_date).toEqual({
                  'BETWEEN': getStartEndOfRange('week', 'YYYY-MM-DD')
                });
              });
            });

            describe('when the month range is selected', function () {
              beforeEach(function () {
                $scope.newCasesPanel.handlers.range('month', $scope.newCasesPanel.query.params);
              });

              it('filters by `start_date` between start and end of the current month', function () {
                expect($scope.newCasesPanel.query.params.start_date).toBeDefined();
                expect($scope.newCasesPanel.query.params.start_date).toEqual({
                  'BETWEEN': getStartEndOfRange('month', 'YYYY-MM-DD')
                });
              });
            });
          });
        });
      });

      describe('custom data', function () {
        it('is defined', function () {
          expect($scope.newCasesPanel.custom).toBeDefined();
        });

        it('sets the custom name of the items to "cases"', function () {
          expect($scope.newCasesPanel.custom.itemName).toBe('cases');
        });

        describe('custom click handler', function () {
          it('is defined', function () {
            expect($scope.newCasesPanel.custom.caseClick).toBeDefined();
          });

          describe('when invoked', function () {
            var $location, mockCase;

            beforeEach(inject(function (_$location_) {
              $location = _$location_;
              mockCase = { id: _.random(1, 10) };

              spyOn($location, 'path').and.callThrough();
              spyOn($location, 'search');

              $scope.newCasesPanel.custom.caseClick(mockCase);
            }));

            it('redirects to the individual case details page', function () {
              expect($location.path).toHaveBeenCalledWith('case/list');
              expect($location.search).toHaveBeenCalledWith('caseId', mockCase.id);
            });
          });
        });
      });

      describe('when the relationship type changes', function () {
        var newFilterValue, newType;

        beforeEach(function () {
          newType = 'is_involed';
          newFilterValue = 'bar';

          $scope.filters.caseRelationshipType = newType;
          $scope.activityFilters.case_filter.foo = newFilterValue;

          $scope.$digest();
        });

        it('adds the properties of the `case_filter` object to the query params', function () {
          expect($scope.newCasesPanel.query.params).toEqual(jasmine.objectContaining({
            foo: newFilterValue
          }));
        });
      });
    });

    describe('panel-query panel: new milestones', function () {
      it('is defined', function () {
        expect($scope.newMilestonesPanel).toBeDefined();
      });

      describe('query', function () {
        it('is defined', function () {
          expect($scope.newMilestonesPanel.query).toBeDefined();
        });

        it('is for the Activity entity', function () {
          expect($scope.newMilestonesPanel.query.entity).toBe('Activity');
        });

        it('does not call a custom endpoint', function () {
          expect($scope.newMilestonesPanel.query.action).not.toBeDefined();
        });

        it('adds the params defined in the relationship filter', function () {
          expect($scope.newMilestonesPanel.query.params)
            .toEqual(jasmine.objectContaining($scope.activityFilters));
        });

        it('fetches only the milestones', function () {
          expect($scope.newMilestonesPanel.query.params['activity_type_id.grouping']).toEqual({
            'LIKE': '%milestone%'
          });
        });

        it('fetches only the user\'s milestones', function () {
          expect($scope.newMilestonesPanel.query.params.contact_id).toBe('user_contact_id');
        });

        it('fetches only the milestones on the current revision', function () {
          expect($scope.newMilestonesPanel.query.params.is_current_revision).toBe(1);
        });

        it('fetches only the non-test, non-deleted milestones', function () {
          expect($scope.newMilestonesPanel.query.params.is_test).toBe(0);
          expect($scope.newMilestonesPanel.query.params.is_deleted).toBe(0);
        });

        it('fetches only the incomplete milestones', function () {
          expect($scope.newMilestonesPanel.query.params.status_id).toEqual({
            'IN': CRM.civicase.activityStatusTypes.incomplete
          });
        });

        it('sorts by is_overdue (descending order) and activity_date_time (ascending order)', function () {
          expect($scope.newMilestonesPanel.query.params.options.sort).toBe('is_overdue DESC, activity_date_time ASC');
        });

        it('asks the api to return only a specific set of fields', function () {
          expect($scope.newMilestonesPanel.query.params.return).toEqual([
            'subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name',
            'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star',
            'original_id', 'tag_id.name', 'tag_id.description', 'tag_id.color', 'file_id',
            'is_overdue', 'case_id', 'priority_id', 'case_id.case_type_id', 'case_id.status_id',
            'case_id.contacts'
          ]);
        });
      });

      describe('handlers', function () {
        describe('results handler', function () {
          var mockedResults = mockResults('case_id.contacts');

          it('is defined', function () {
            expect($scope.newMilestonesPanel.handlers.results).toBeDefined();
          });

          describe('when invoked', function () {
            var contactsCount, ContactsDataService;

            beforeEach(inject(function (_ContactsDataService_) {
              ContactsDataService = _ContactsDataService_;
            }));

            beforeEach(function () {
              spyOn(ContactsDataService, 'add');

              contactsCount = countTotalAndUniqueContactIds(mockedResults, 'case_id.contacts');
              $scope.newMilestonesPanel.handlers.results(mockedResults);
            });

            it('calls the formatCase service on each result item', function () {
              expect(formatActivityMock.calls.count()).toBe(mockedResults.length);
            });

            it('calls ContactsDataService.add() with a duplicate-free list of the results\'s contacts', function () {
              var contactIds = ContactsDataService.add.calls.argsFor(0)[0];

              expect(ContactsDataService.add).toHaveBeenCalled();
              expect(contactIds).not.toEqual(contactsCount.total);
              expect(contactIds).toEqual(contactsCount.uniq);
            });
          });
        });

        describe('range handler', function () {
          it('is defined', function () {
            expect($scope.newMilestonesPanel.handlers.range).toBeDefined();
          });

          describe('when invoked', function () {
            describe('when the week range is selected', function () {
              beforeEach(function () {
                $scope.newMilestonesPanel.handlers.range('week', $scope.newMilestonesPanel.query.params);
              });

              it('filters by `activity_date_time` between today and end of the current week', function () {
                expect($scope.newMilestonesPanel.query.params.activity_date_time).toBeDefined();
                expect($scope.newMilestonesPanel.query.params.activity_date_time).toEqual({
                  'BETWEEN': getStartEndOfRange('week', 'YYYY-MM-DD HH:mm:ss', true)
                });
              });
            });

            describe('when the month range is selected', function () {
              beforeEach(function () {
                $scope.newMilestonesPanel.handlers.range('month', $scope.newMilestonesPanel.query.params);
              });

              it('filters by `activity_date_time` between today and end of the current month', function () {
                expect($scope.newMilestonesPanel.query.params.activity_date_time).toBeDefined();
                expect($scope.newMilestonesPanel.query.params.activity_date_time).toEqual({
                  'BETWEEN': getStartEndOfRange('month', 'YYYY-MM-DD HH:mm:ss', true)
                });
              });
            });
          });
        });
      });

      describe('custom data', function () {
        it('is defined', function () {
          expect($scope.newMilestonesPanel.custom).toBeDefined();
        });

        it('sets the custom name of the items to "milestones"', function () {
          expect($scope.newMilestonesPanel.custom.itemName).toBe('milestones');
        });

        describe('activity involvement filter', function () {
          it('is defined', function () {
            expect($scope.newMilestonesPanel.custom.involvementFilter).toBeDefined();
          });

          it('is set to "myActivities" by default', function () {
            expect($scope.newMilestonesPanel.custom.involvementFilter).toEqual({
              '@involvingContact': 'myActivities'
            });
          });

          describe('when it changes', function () {
            beforeEach(function () {
              spyOn($rootScope, '$broadcast');

              $scope.newMilestonesPanel.custom.involvementFilter = { '@involvingContact': '' };
              $scope.$digest();
            });

            it('broadcasts a "civicaseActivityFeed.query" event', function () {
              expect($rootScope.$broadcast).toHaveBeenCalledWith(
                'civicaseActivityFeed.query',
                $scope.newMilestonesPanel.custom.involvementFilter,
                $scope.newMilestonesPanel.query.params,
                true
              );
            });
          });
        });
      });

      describe('when the relationship type changes', function () {
        var newFilterValue, newType;

        beforeEach(function () {
          newType = 'is_involed';
          newFilterValue = 'bar';

          $scope.filters.caseRelationshipType = newType;
          $scope.activityFilters.case_filter.foo = newFilterValue;

          $scope.$digest();
        });

        it('adds the properties of the `case_filter` object to the query params', function () {
          expect($scope.newMilestonesPanel.query.params.case_filter.foo).toEqual(newFilterValue);
        });
      });
    });

    /**
     * Initializes the controller and digests the scope
     */
    function initController () {
      $controller('dashboardTabController', {
        $scope: $scope,
        formatActivity: formatActivityMock,
        formatCase: formatCaseMock
      });
      $scope.$digest();
    }

    /**
     * Given a list of mocked results, it will find all the contact ids in the
     * given "contacts list" property and returns the total of all the ids and of
     * all the unique ids
     *
     * @param {Array} mockResults
     * @param {Array} contactsListKey
     * @return {Object}
     */
    function countTotalAndUniqueContactIds (mockedResults, contactsListKey) {
      var total, uniq;

      uniq = _(mockedResults)
        .pluck(contactsListKey).flatten()
        .pluck('contact_id')
        .tap(function (nonUniq) {
          total = nonUniq;
          return nonUniq;
        })
        .uniq().value();

      return { total: total, uniq: uniq };
    }

    /**
     * Returns the start and end of the given range (week/month) formatted
     * in the given format
     *
     * @param {String} range
     * @param {String} format
     * @return {Array}
     */
    function getStartEndOfRange (range, format, useNowAsStart) {
      var now = moment();
      var start = (useNowAsStart ? now : now.startOf(range)).format(format);
      var end = now.endOf(range).format(format);

      return [start, end];
    }

    /**
     * Mocks the formatActivity and formatCase functions
     */
    function mockFormatFunctions () {
      formatActivityMock = jasmine.createSpy(formatActivity)
        .and.callFake(function (activity) {
          return activity;
        });

      formatCaseMock = jasmine.createSpy(formatCase)
        .and.callFake(function (caseObj) {
          return caseObj;
        });
    }

    /**
     * Mocks a list of results (either cases or activities), and for each of them
     * places a list of mocked contacts in the property with the given name
     *
     * @param {String} contactsListKey
     */
    function mockResults (contactsListKey) {
      return _.times(5, function () {
        var obj = {};
        obj[contactsListKey] = _.times(2, function () {
          return { contact_id: _.random(1, 5) };
        });

        return obj;
      });
    }
  });
}(CRM.$, CRM._, moment));
