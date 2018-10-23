/* eslint-env jasmine */
(function ($) {
  fdescribe('panelQuery', function () {
    var element, $compile, $rootScope, $scope;

    beforeEach(module('civicase.templates', 'civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
    }));

    describe('[query-data] attribute', function () {
      var isolatedScope;

      beforeEach(function () {
        $scope.queryData = { query: { entity: 'Foo', params: { foo: 'foo' } } };
        compileDirective();
        isolatedScope = element.isolateScope();
      });

      it('store its value in its scope', function () {
        expect(isolatedScope.queryData).toBeDefined();
        expect(isolatedScope.queryData).toEqual($scope.queryData);
      });

      describe('one-way binding', function () {
        var originalSource;

        beforeEach(function () {
          originalSource = $scope.queryData;
          isolatedScope.queryData = { baz: 'baz' };

          $scope.$digest();
        });

        it('has a one-way binding on the [query-data] value', function () {
          expect($scope.queryData).toEqual(originalSource);
        });
      });

      describe('`query` object', function () {
        var $log;

        beforeEach(inject(function (_$log_) {
          $log = _$log_;
        }));

        beforeEach(function () {
          spyOn($log, 'error');
        });

        describe('when it is not present', function () {
          beforeEach(function () {
            $scope.queryData = {};
          });

          it('throws', function () {
            expect(compileDirective).toThrowError(/query/);
          });
        });

        describe('when it doesn\'t have the `entity` property', function () {
          beforeEach(function () {
            $scope.queryData = { query: { params: {} } };
          });

          it('sends an error message', function () {
            expect(compileDirective).toThrowError(/entity/);
          });
        });

        describe('when the `entity` property is an empty string', function () {
          beforeEach(function () {
            $scope.queryData = { query: { entity: '', params: {} } };
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
          $scope.queryData = { query: { entity: 'OuterEntity', params: { foo: 'outerParam' } } };
          $scope.passedData = { query: { entity: 'IsolatedEntity', params: { foo: 'isolatedParam' } } };

          compileDirective({
            actions: '<div>{{queryData.query.entity}}</div>',
            results: '<div>{{queryData.query.params.foo}}</div>'
          }, 'passedData');
        });

        it('compiles the slot on its own isolated scope', function () {
          var actionsHtml = element.find('[ng-transclude="actions"]').html();
          var resultsHtml = element.find('[ng-transclude="results"]').html();

          expect(actionsHtml).toContain($scope.passedData.query.entity);
          expect(resultsHtml).toContain($scope.passedData.query.params.foo);
        });
      });
    });

    /**
     * Function responsible for setting up compilation of the directive
     *
     * @param {Object} slot the transclude slots with their markup
     */
    function compileDirective (slots, dataProperty) {
      var content = '';
      var html = '<civicase-panel-query query-data="%{dataProperty}">%{content}</civicase-panel-query>';

      dataProperty = dataProperty || 'queryData';
      slots = slots || { results: '<div></div>' };

      $scope[dataProperty] = $scope[dataProperty] || {
        query: { entity: 'FooBar', params: [] }
      };

      content += slots.actions ? '<panel-query-actions>' + slots.actions + '</panel-query-actions>' : '';
      content += slots.results ? '<panel-query-results>' + slots.results + '</panel-query-results>' : '';

      html = html.replace('%{dataProperty}', dataProperty);
      html = html.replace('%{content}', content);

      element = $compile(html)($scope);

      $scope.$digest();
    }
  });
}(CRM.$));
