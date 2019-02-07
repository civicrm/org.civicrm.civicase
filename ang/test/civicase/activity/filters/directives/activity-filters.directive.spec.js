/* eslint-env jasmine */

(function ($, _) {
  describe('civicaseActivityFilters', function () {
    var $compile, $rootScope, $scope, activityFilters;

    beforeEach(module('civicase', 'civicase.templates', function () {
      killDirective('civicaseActivityFiltersContact');
    }));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      spyOn($rootScope, '$broadcast');

      $scope = $rootScope.$new();

      initDirective();
    }));

    describe('when clicking more filters button', function () {
      beforeEach(function () {
        activityFilters.isolateScope().filters = {};
        activityFilters.isolateScope().filters['@moreFilters'] = true;
        activityFilters.isolateScope().toggleMoreFilters();
      });

      it('toggles more filters visibility', function () {
        expect(activityFilters.isolateScope().filters['@moreFilters']).toEqual(false);
      });

      it('fires an event', function () {
        expect($rootScope.$broadcast)
          .toHaveBeenCalledWith('civicase::activity-filters::more-filters-toggled');
      });
    });

    /**
     * Initializes the ActivityPanel directive
     */
    function initDirective () {
      activityFilters = $compile('<div civicase-activity-filters></div>')($scope);
      $scope.$digest();
    }

    /**
     * Mocks a directive
     *
     * @param {String} directiveName
     */
    function killDirective (directiveName) {
      angular.mock.module(function ($compileProvider) {
        $compileProvider.directive(directiveName, function () {
          return {
            priority: 9999999,
            terminal: true
          };
        });
      });
    }
  });
})(CRM.$, CRM._);
