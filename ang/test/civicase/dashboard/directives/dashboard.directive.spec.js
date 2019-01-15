/* eslint-env jasmine */

(function (_) {
  describe('civicaseDashboardController', function () {
    var $controller, $rootScope, $scope;

    beforeEach(module('civicase', 'civicase.data'));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;

      $scope = $rootScope.$new();
      $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');

      spyOn(CRM, 'checkPerm');
    }));

    describe('filter', function () {
      describe('when user has permission to view all cases', function () {
        beforeEach(function () {
          CRM.checkPerm.and.returnValue(true);
          initController();
        });

        it('shows the `All Cases` filter option', function () {
          expect($scope.caseRelationshipOptions).toEqual([
            { 'text': 'My cases', 'id': 'is_case_manager' },
            { 'text': 'Cases I am involved in', 'id': 'is_involved' },
            { 'text': 'All Cases', 'id': 'all' }
          ]);
        });
      });

      describe('when user does not have permission to view all cases', function () {
        beforeEach(function () {
          CRM.checkPerm.and.returnValue(false);
          initController();
        });

        it('does not show the `All Cases` filter option', function () {
          expect($scope.caseRelationshipOptions).toEqual([
            { 'text': 'My cases', 'id': 'is_case_manager' },
            { 'text': 'Cases I am involved in', 'id': 'is_involved' }
          ]);
        });
      });
    });

    describe('caseRelationshipType watcher', function () {
      describe('when `My Cases` filter is applied', function () {
        beforeEach(function () {
          initController();
          $scope.filters.caseRelationshipType = 'is_case_manager';
          $scope.$digest();
        });

        it('filters the cases and activties where the user is the manager', function () {
          expect($scope.activityFilters.case_filter).toEqual(jasmine.objectContaining({
            case_manager: CRM.config.user_contact_id
          }));
        });
      });

      describe('when `Cases I am Involved` filter is applied', function () {
        beforeEach(function () {
          initController();
          $scope.filters.caseRelationshipType = 'is_involved';
          $scope.$digest();
        });

        it('filters the cases and activties where the user is involved', function () {
          expect($scope.activityFilters.case_filter).toEqual(jasmine.objectContaining({
            contact_involved: {'IN': [CRM.config.user_contact_id]}
          }));
        });
      });
    });

    /**
     * Initializes the dashboard controller.
     */
    function initController () {
      $controller('civicaseDashboardController', {
        $scope: $scope
      });
    }
  });
})(CRM._);
