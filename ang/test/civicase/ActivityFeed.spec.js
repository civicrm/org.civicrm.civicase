/* eslint-env jasmine */

(function (_) {
  describe('civicaseActivityFeed', function () {
    describe('Activity Feed Controller', function () {
      var $provide, $controller, $rootScope, $scope, $q, crmApi, CaseTypes;

      beforeEach(module('civicase', 'civicase.data', function (_$provide_) {
        $provide = _$provide_;
      }));

      beforeEach(inject(function () {
        $provide.factory('crmThrottle', function () {
          var crmThrottle = jasmine.createSpy('crmThrottle');

          crmThrottle.and.callFake(function (callable) {
            callable();

            return $q.resolve([{
              acts: { values: [] }
            }]);
          });

          return crmThrottle;
        });
      }));

      beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, _CaseTypes_, _crmApi_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        CaseTypes = _CaseTypes_;

        $scope = $rootScope.$new();
        $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');
        crmApi = _crmApi_;
      }));

      describe('loadActivities', function () {
        describe('when filtered by activity set and activity id', function () {
          var expectedActivityTypeIDs = [];

          beforeEach(function () {
            crmApi.and.returnValue($q.resolve({acts: {}}));
            initController();
            $scope.filters.activitySet = CaseTypes.get()['1'].definition.activitySets[0].name;
            $scope.filters.activity_type_id = '5';
            $scope.$digest();

            _.each(CaseTypes.get()['1'].definition.activitySets[0].activityTypes, function (activityTypeFromSet) {
              expectedActivityTypeIDs.push(_.findKey(CRM.civicase.activityTypes, function (activitySet) {
                return activitySet.name === activityTypeFromSet.name;
              }));
            });
            expectedActivityTypeIDs.push($scope.filters.activity_type_id);
          });

          it('filters by the activities of the selected activity set and the activity id', function () {
            var args = crmApi.calls.mostRecent().args[0].acts[2].activity_type_id;
            expect(args).toEqual({ IN: expectedActivityTypeIDs });
          });
        });
      });

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
})(CRM._);
