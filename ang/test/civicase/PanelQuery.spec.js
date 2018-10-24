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
        return jasmine.any(Object);
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
          $scope.passedData = { entity: 'IsolatedEntity', params: { foo: 'isolatedParam' } };

          compileDirective({
            actions: '<div>{{query.entity}}</div>',
            results: '<div>{{query.params.foo}}</div>'
          }, 'passedData');
        });

        it('compiles the slot on its own isolated scope', function () {
          var actionsHtml = element.find('[ng-transclude="actions"]').html();
          var resultsHtml = element.find('[ng-transclude="results"]').html();

          expect(actionsHtml).toContain($scope.passedData.entity);
          expect(resultsHtml).toContain($scope.passedData.params.foo);
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
      beforeEach(function () {
        $scope.queryData = {
          entity: 'SomeEntity',
          params: { foo: 'foo', bar: 'bar' }
        };
        compileDirective();
        crmApi.calls.reset();
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
      });
    });
    /**
     * Function responsible for setting up compilation of the directive
     *
     * @param {Object} slot the transclude slots with their markup
     */
    function compileDirective (slots, queryProperty) {
      var content = '';
      var html = '<civicase-panel-query query="%{queryProperty}">%{content}</civicase-panel-query>';

      queryProperty = queryProperty || 'queryData';
      slots = slots || { results: '<div></div>' };

      $scope[queryProperty] = $scope[queryProperty] || {
        entity: 'FooBar', params: []
      };

      content += slots.actions ? '<panel-query-actions>' + slots.actions + '</panel-query-actions>' : '';
      content += slots.results ? '<panel-query-results>' + slots.results + '</panel-query-results>' : '';

      html = html.replace('%{queryProperty}', queryProperty);
      html = html.replace('%{content}', content);

      element = $compile(html)($scope);

      $scope.$digest();
    }
  });
}(CRM.$, CRM._));
