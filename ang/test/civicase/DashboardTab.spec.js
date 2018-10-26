/* eslint-env jasmine */
(function ($, _, moment) {
  describe('dashboardTabController', function () {
    var $controller, $rootScope, $scope, formatCaseMock;

    beforeEach(module('civicase.templates', 'civicase', 'crmUtil'));
    beforeEach(inject(function (_$controller_, _$rootScope_, formatCase) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();

      $scope.filters = { caseRelationshipType: 'all' };
      $scope.activityFilters = {
        case_filter: { foo: 'foo' }
      };

      formatCaseMock = jasmine.createSpy(formatCase).and.callFake(function (aCase) {
        return aCase;
      });

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
          var mockedResults = _.times(5, function () {
            return {
              contacts: _.times(2, function () {
                return { contact_id: _.random(1, 5) };
              })
            };
          });

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

              contactsCount = countTotalAndUniqueContactIds(mockedResults);
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

            function countTotalAndUniqueContactIds (mockedResults) {
              var total, uniq;

              uniq = _(mockedResults)
                .pluck('contacts').flatten()
                .pluck('contact_id')
                .tap(function (nonUniq) {
                  total = nonUniq;
                  return nonUniq;
                })
                .uniq().value();

              return { total: total, uniq: uniq };
            }
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
                  'BETWEEN': getStartEndOfRange('week')
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
                  'BETWEEN': getStartEndOfRange('month')
                });
              });
            });

            function getStartEndOfRange (range) {
              return [
                moment().startOf(range).format('YYYY-MM-DD'),
                moment().endOf(range).format('YYYY-MM-DD')
              ];
            }
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

    function initController () {
      $controller('dashboardTabController', {
        $scope: $scope,
        formatCase: formatCaseMock
      });
      $scope.$digest();
    }
  });
}(CRM.$, CRM._, moment));
