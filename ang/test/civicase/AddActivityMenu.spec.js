/* eslint-env jasmine */

(function (_, caseTypes) {
  describe('AddActivityMenu', function () {
    describe('Add Activity Menu Controller', function () {
      var $controller, $rootScope, $scope;

      beforeEach(module('civicase'));

      beforeEach(inject(function (_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
      }));

      describe('creating the activity count', function () {
        var expectedActivityCount;

        beforeEach(function () {
          var activityTypeIds = [_.uniqueId(), _.uniqueId(), _.uniqueId()];
          var mockCase = {
            allActivities: [
              { id: _.uniqueId(), activity_type_id: activityTypeIds[0] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[0] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[0] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[1] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[1] },
              { id: _.uniqueId(), activity_type_id: activityTypeIds[2] }
            ]
          };
          expectedActivityCount = {};
          expectedActivityCount[activityTypeIds[0]] = 3;
          expectedActivityCount[activityTypeIds[1]] = 2;
          expectedActivityCount[activityTypeIds[2]] = 1;

          initController(mockCase);
        });

        it('creates a list of activity counts', function () {
          expect($scope.case.activity_count).toEqual(expectedActivityCount);
        });
      });

      /**
       * Initializes the add activity menu controller.
       *
       * @param {Object} caseData a sample case to pass to the controller.
       */
      function initController (caseData) {
        $scope = $rootScope.$new();
        $scope.case = caseData;

        $controller('civicaseAddActivityMenuController', {
          $scope: $scope
        });
      }
    });
  });
})(CRM._, CRM.civicase.caseTypes);
