/* eslint-env jasmine */
(function ($) {
  describe('panelQuery', function () {
    var element, $compile, $rootScope, $scope;

    beforeEach(module('civicase.templates', 'civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
    }));

    describe('attributes', function () {
      var isolatedScope;

      beforeEach(function () {
        $scope.mockQueryData = { foo: 'foo', bar: 'bar' };
        compileDirective('query-data="mockQueryData"', { results: '<div></div>' });
        isolatedScope = element.isolateScope();
      });

      it('supports a [query-data] attribute and store its value in its scope', function () {
        expect(isolatedScope.queryData).toBeDefined();
        expect(isolatedScope.queryData).toEqual($scope.mockQueryData);
      });

      describe('one-way binding', function () {
        var originalSource;

        beforeEach(function () {
          originalSource = $scope.mockQueryData;
          isolatedScope.queryData = { baz: 'baz' };

          $scope.$digest();
        });

        it('has a one-way binding on the [query-data] value', function () {
          expect($scope.mockQueryData).toEqual(originalSource);
        });
      });
    });

    describe('transclude slots', function () {
      it('requires the <panel-query-results> slot to be present', function () {
        expect(function () {
          compileDirective(null);
        }).toThrow();
      });

      it('is optional to pass the <panel-query-actions> slot', function () {
        expect(function () {
          compileDirective(null, { results: '<div></div>' });
        }).not.toThrow();
      });

      describe('scope compile', function () {
        beforeEach(function () {
          $scope.queryData = { foo: 'outer-foo', bar: 'outer-bar' };
          $scope.passedData = { foo: 'isolated-foo', bar: 'isolated-bar' };

          compileDirective('query-data="passedData"', {
            actions: '<div>{{queryData.foo}}</div>',
            results: '<div>{{queryData.bar}}</div>'
          });
        });

        it('compiles the slot on its own isolated scope', function () {
          var actionsHtml = element.find('[ng-transclude="actions"]').html();
          var resultsHtml = element.find('[ng-transclude="results"]').html();

          expect(actionsHtml).toContain($scope.passedData.foo);
          expect(resultsHtml).toContain($scope.passedData.bar);
        });
      });
    });

    /**
     * Function responsible for setting up compilation of the directive
     *
     * @param {String} attributes the attributes to add to the directive tag
     * @param {Object} slot the transclude slots with their markup
     */
    function compileDirective (attributes, slot) {
      var content = '';
      var html = '<civicase-panel-query %{attributes}>%{content}</civicase-panel-query>';

      attributes = attributes || '';
      slot = slot || {};

      content += slot.actions ? '<panel-query-actions>' + slot.actions + '</panel-query-actions>' : '';
      content += slot.results ? '<panel-query-results>' + slot.results + '</panel-query-results>' : '';

      html = html.replace('%{attributes}', attributes);
      html = html.replace('%{content}', content);

      element = $compile(html)($scope);

      $scope.$digest();
    }
  });
}(CRM.$));
