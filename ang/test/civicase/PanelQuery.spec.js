/* eslint-env jasmine */
(function ($, _) {
  describe('panelQuery', function () {
    var element, $compile, $q, $rootScope, $scope, crmApi, mockedResults;
    var NO_OF_RESULTS = 10;

    beforeEach(module('civicase.templates', 'civicase', 'crmUtil'));

    beforeEach(inject(function (_$compile_, _$q_, _$rootScope_, _crmApi_) {
      $compile = _$compile_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      crmApi = _crmApi_;

      $scope = $rootScope.$new();
      mockedResults = _.times(NO_OF_RESULTS, function () {
        return { id: _.random(1, 10) };
      });

      crmApi.and.returnValue($q.resolve({
        get: { values: mockedResults },
        count: NO_OF_RESULTS
      }));
    }));

    describe('[query] attribute', function () {
      var isolatedScope;

      beforeEach(function () {
        $scope.queryData = { entity: 'Foo', params: { foo: 'foo' } };
        compileDirective();
        isolatedScope = element.isolateScope();
      });

      it('store its value in its scope', function () {
        expect(isolatedScope.query).toBeDefined();
        expect(isolatedScope.query).toEqual($scope.queryData);
      });

      describe('one-way binding', function () {
        var originalSource;

        beforeEach(function () {
          originalSource = $scope.queryData;
          isolatedScope.query = { baz: 'baz' };

          $scope.$digest();
        });

        it('has a one-way binding on the [query-data] value', function () {
          expect($scope.queryData).toEqual(originalSource);
        });
      });

      describe('`query` object', function () {
        describe('when it doesn\'t have the `entity` property', function () {
          beforeEach(function () {
            $scope.queryData = { params: {} };
          });

          it('sends an error message', function () {
            expect(compileDirective).toThrowError(/entity/);
          });
        });

        describe('when the `entity` property is an empty string', function () {
          beforeEach(function () {
            $scope.queryData = { entity: '', params: {} };
          });

          it('sends an error message', function () {
            expect(compileDirective).toThrowError(/entity/);
          });
        });
      });
    });

    describe('[handlers] attribute', function () {
      describe('results handler', function () {
        var isolatedScope;
        var resultsHandler = jasmine.createSpy().and.callFake(function (item) {
          item.baz = 'baz';

          return item;
        });

        beforeEach(function () {
          $scope.handlersData = { results: resultsHandler };

          compileDirective();
          isolatedScope = element.isolateScope();
        });

        it('is called', function () {
          expect(resultsHandler).toHaveBeenCalled();
        });

        it('receives a result item as an argument', function () {
          var arg = resultsHandler.calls.argsFor(0)[0];

          expect(arg.id).toBeDefined();
        });

        it('allows to modify the items before they are stored', function () {
          expect(isolatedScope.results.every(function (item) {
            return typeof item.baz !== 'undefined';
          })).toBe(true);
        });
      });

      describe('title handler', function () {
        var isolatedScope;
        var titleHandler = jasmine.createSpy().and.callFake(function (total) {
          return 'The total number of items is' + total;
        });

        beforeEach(function () {
          $scope.handlersData = { title: titleHandler };

          compileDirective();
          isolatedScope = element.isolateScope();
        });

        it('is called', function () {
          expect(titleHandler).toHaveBeenCalled();
        });

        it('receives the total count as an argument', function () {
          var arg = titleHandler.calls.argsFor(0)[0];

          expect(arg).toBe(NO_OF_RESULTS);
        });

        it('allows to modify the title of the panel', function () {
          expect(isolatedScope.title).toBe('The total number of items is' + NO_OF_RESULTS);
        });
      });

      describe('range handler', function () {
        var rangeHandler;

        beforeEach(function () {
          rangeHandler = jasmine.createSpy().and.callFake(function (selectedRange) {});
          $scope.handlersData = { range: rangeHandler };

          compileDirective();
        });

        it('is not called on init', function () {
          expect(rangeHandler).not.toHaveBeenCalled();
        });

        describe('when the selected range changes', function () {
          var isolatedScope;
          var newRange = 'month';

          beforeEach(function () {
            rangeHandler.calls.reset();
            isolatedScope = element.isolateScope();

            isolatedScope.selectedRange = newRange;
            isolatedScope.$digest();
          });

          it('is called when the selected range changes', function () {
            expect(rangeHandler).toHaveBeenCalled();
          });

          it('receives the new selected range as an argument', function () {
            var arg = rangeHandler.calls.argsFor(0)[0];

            expect(arg).toBe(newRange);
          });

          it('receives the query params as an argument', function () {
            var arg = rangeHandler.calls.argsFor(0)[1];

            expect(arg).toEqual($scope.queryData.params);
          });
        });
      });
    });

    describe('[custom-data] attribute', function () {
      var isolatedScope;
      beforeEach(function () {
        $scope.customData = {
          customProp: 'foobarbaz',
          customFn: function () {}
        };

        compileDirective();
        isolatedScope = element.isolateScope();
      });

      it('is stored in the isolated scope', function () {
        expect(_.isEmpty(isolatedScope.customData)).toBe(false);
        expect(isolatedScope.customData).toEqual(jasmine.objectContaining($scope.customData));
      });
    });

    describe('transclude slots', function () {
      it('requires the <panel-query-results> slot to be present', function () {
        expect(function () {
          compileDirective({});
        }).toThrow();
      });

      it('is optional to pass the <panel-query-actions> slot', function () {
        expect(function () {
          compileDirective({ results: '<div></div>' });
        }).not.toThrow();
      });

      describe('scope compile', function () {
        beforeEach(function () {
          $scope.query = { entity: 'OuterEntity', params: { foo: 'outerParam' } };
          $scope.queryData = { entity: 'IsolatedEntity', params: { foo: 'isolatedParam' } };

          compileDirective({
            actions: '<div>{{query.entity}}</div>',
            results: '<div>{{query.params.foo}}</div>'
          });
        });

        it('compiles the slot on its own isolated scope', function () {
          var actionsHtml = element.find('[ng-transclude="actions"]').html();
          var resultsHtml = element.find('[ng-transclude="results"]').html();

          expect(actionsHtml).toContain($scope.queryData.entity);
          expect(resultsHtml).toContain($scope.queryData.params.foo);
        });
      });
    });

    describe('api requests', function () {
      var isolatedScope, requests;

      beforeEach(function () {
        $scope.queryData = {
          entity: 'SomeEntity',
          params: { foo: 'foo', bar: 'bar' }
        };
        compileDirective();

        isolatedScope = element.isolateScope();
        requests = crmApi.calls.argsFor(0)[0];
      });

      it('sends two api requests on init', function () {
        expect(crmApi).toHaveBeenCalled();
        expect(_.isObject(requests)).toEqual(true);
        expect(Object.keys(requests).length).toBe(2);
      });

      describe('first request', function () {
        var request;

        beforeEach(function () {
          request = requests[Object.keys(requests)[0]];
        });

        it('is for the given entity', function () {
          var entity = request[0];

          expect(entity).toBe($scope.queryData.entity);
        });

        it('is for fetching the data', function () {
          var action = request[1];

          expect(action).toBe('get');
        });

        describe('params', function () {
          var requestParams;

          beforeEach(function () {
            requestParams = request[2];
          });

          it('passes to the api the params in the `query` object', function () {
            expect(requestParams).toEqual(jasmine.objectContaining($scope.queryData.params));
          });

          it('automatically adds `sequential` to the params', function () {
            expect(requestParams).toEqual(jasmine.objectContaining({ sequential: 1 }));
          });

          describe('pagination', function () {
            var isolatedScope;

            beforeEach(function () {
              isolatedScope = element.isolateScope();
            });

            it('adds the pagination params', function () {
              expect(requestParams.options).toBeDefined();
              expect(requestParams.options.limit).toBe(isolatedScope.pagination.size);
              expect(requestParams.options.offset).toBeDefined(isolatedScope.pagination.page + isolatedScope.pagination.size);
            });
          });
        });

        describe('results', function () {
          it('stores the list of results', function () {
            expect(isolatedScope.results).toEqual(mockedResults);
          });
        });
      });

      describe('second request', function () {
        var request;

        beforeEach(function () {
          request = requests[Object.keys(requests)[1]];
        });

        it('is for the given entity', function () {
          var entity = request[0];

          expect(entity).toBe($scope.queryData.entity);
        });

        it('is for getting the total count', function () {
          var action = request[1];

          expect(action).toBe('getcount');
        });

        it('passes to the api the params in the `query` object', function () {
          expect(request[2]).toEqual($scope.queryData.params);
        });

        it('stores the count', function () {
          expect(isolatedScope.total).toEqual(NO_OF_RESULTS);
        });
      });
    });

    describe('watchers', function () {
      var titleHandler = jasmine.createSpy();

      beforeEach(function () {
        $scope.handlersData = { title: titleHandler };

        compileDirective();
        crmApi.calls.reset();
        titleHandler.calls.reset();
      });

      describe('when the query params change', function () {
        var getRequest, countRequest;

        beforeEach(function () {
          $scope.queryData.params.baz = 'baz';
          $scope.$digest();

          getRequest = crmApi.calls.argsFor(0)[0].get;
          countRequest = crmApi.calls.argsFor(0)[0].count;
        });

        it('triggers the api requests again', function () {
          expect(crmApi).toHaveBeenCalled();
        });

        it('passes the new params to the api', function () {
          expect(getRequest[2]).toEqual(jasmine.objectContaining({ baz: 'baz' }));
          expect(countRequest[2]).toEqual(jasmine.objectContaining({ baz: 'baz' }));
        });

        it('calls the title handler again', function () {
          expect(titleHandler).toHaveBeenCalled();
        });
      });
    });

    describe('pagination', function () {
      var isolatedScope;

      beforeEach(function () {
        compileDirective();
        isolatedScope = element.isolateScope();
      });

      it('starts from page 1', function () {
        expect(isolatedScope.pagination.page).toBe(1);
      });

      it('has a default page size of 5', function () {
        expect(isolatedScope.pagination.size).toBe(5);
      });

      describe('range calculation', function () {
        describe('from', function () {
          it('calculated from: current page and page size', function () {
            expect(isolatedScope.pagination.range.from).toBe(1);

            isolatedScope.pagination.page = 3;
            isolatedScope.$digest();

            expect(isolatedScope.pagination.range.from).toBe(11);
          });
        });

        describe('to', function () {
          beforeEach(function () {
            isolatedScope.total = 19;
          });

          it('calculated from: current page, page size, total count', function () {
            expect(isolatedScope.pagination.range.to).toBe(5);

            isolatedScope.pagination.page = 3;
            isolatedScope.$digest();

            expect(isolatedScope.pagination.range.to).toBe(15);

            isolatedScope.pagination.page = 4;
            isolatedScope.$digest();

            expect(isolatedScope.pagination.range.to).toBe(19);
          });
        });
      });
    });

    describe('period range', function () {
      var isolatedScope;

      beforeEach(function () {
        compileDirective();
        isolatedScope = element.isolateScope();
      });

      it('has a list of available ranges to select from', function () {
        expect(isolatedScope.periodRange.map(function (range) {
          return range.value;
        })).toEqual(['week', 'month']);
      });

      it('has the week range selected by default', function () {
        expect(isolatedScope.selectedRange).toBe('week');
      });
    });

    /**
     * Function responsible for setting up compilation of the directive
     *
     * @param {Object} slots the transclude slots with their markup
     */
    function compileDirective (slots) {
      var attributes = 'query="queryData"';
      var content = '';
      var html = '<civicase-panel-query %{attributes}>%{content}</civicase-panel-query>';

      slots = slots || { results: '<div></div>' };

      $scope.queryData = $scope.queryData || {
        entity: 'FooBar', params: { foo: 'foo', bar: 'bar' }
      };

      attributes += $scope.handlersData ? ' handlers="handlersData"' : '';
      attributes += $scope.customData ? ' custom-data="customData"' : '';

      content += slots.actions ? '<panel-query-actions>' + slots.actions + '</panel-query-actions>' : '';
      content += slots.results ? '<panel-query-results>' + slots.results + '</panel-query-results>' : '';

      html = html.replace('%{attributes}', attributes);
      html = html.replace('%{content}', content);

      element = $compile(html)($scope);

      $scope.$digest();
    }
  });
}(CRM.$, CRM._));
