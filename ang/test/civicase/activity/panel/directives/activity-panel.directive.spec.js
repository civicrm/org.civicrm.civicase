/* eslint-env jasmine */

(function ($, _) {
  describe('civicaseActivityPanel', function () {
    var $compile, $rootScope, $scope, activityPanel, activitiesMockData, refreshFunction, formatActivity;

    beforeEach(module('civicase', 'civicase.templates', 'civicase.data'));

    beforeEach(inject(function (_$compile_, _$rootScope_, _activitiesMockData_, _formatActivity_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      activitiesMockData = _activitiesMockData_;
      formatActivity = _formatActivity_;

      $scope = $rootScope.$new();

      CRM.url.and.returnValue('crm url mock');
      refreshFunction = jasmine.createSpy('refresh');

      spyOn($rootScope, '$broadcast').and.callThrough();

      initDirective();
    }));

    describe('on init', function () {
      describe('in activity status dropdown', function () {
        var expectedActivityStatuses;

        beforeEach(function () {
          expectedActivityStatuses = {};

          _.each(CRM.civicase.activityStatuses, function (activityStatus, activityStatusID) {
            var ifStatusIsInSameCategory = _.intersection($scope.viewingActivity.category, activityStatus.grouping.split(',')).length > 0;
            var ifStatusIsInNoneCategory = $scope.viewingActivity.category.length === 0 && activityStatus.grouping.split(',').indexOf('none') !== -1;

            if (ifStatusIsInSameCategory || ifStatusIsInNoneCategory) {
              expectedActivityStatuses[activityStatusID] = activityStatus;
            }
          });
        });

        it('shows the activity status except the current one', function () {
          expect(activityPanel.isolateScope().allowedActivityStatuses).toEqual(expectedActivityStatuses);
        });
      });

      it('shows the activity details', function () {
        expect(CRM.loadForm).toHaveBeenCalledWith('crm url mock', jasmine.objectContaining({target: jasmine.any(Object)}));
        expect(CRM.url).toHaveBeenCalledWith('civicrm/activity', {
          action: 'view',
          id: $scope.viewingActivity.id,
          reset: 1,
          context: 'case'
        });
      });
    });

    describe('closeDetailsPanel', function () {
      beforeEach(function () {
        activityPanel.isolateScope().closeDetailsPanel();
      });

      it('closes the activity panel', function () {
        expect(activityPanel.isolateScope().activity.id).toBeUndefined();
      });

      it('fires and event to notify the closing of activity panel', function () {
        expect($rootScope.$broadcast)
          .toHaveBeenCalledWith('civicase::activity-feed::hide-activity-panel');
      });
    });

    describe('setStatusTo', function () {
      var activity;

      beforeEach(function () {
        activity = formatActivity(activitiesMockData.get()[0]);
        activityPanel.isolateScope().setStatusTo(activity, 2);
      });

      it('changes the status to the new value', function () {
        expect(activityPanel.isolateScope().refresh).toHaveBeenCalledWith([['Activity', 'setvalue', {id: activity.id, field: 'status_id', value: 2}]], true);
      });
    });

    describe('setPriorityTo', function () {
      var activity;

      beforeEach(function () {
        activity = formatActivity(activitiesMockData.get()[0]);
        activityPanel.isolateScope().setPriorityTo(activity, 2);
      });

      it('changes the priority to the new value', function () {
        expect(activityPanel.isolateScope().refresh).toHaveBeenCalledWith([['Activity', 'setvalue', {id: activity.id, field: 'priority_id', value: 2}]], true);
      });
    });

    /**
     * Initializes the ActivityPanel directive
     */
    function initDirective () {
      $scope.refreshFunction = refreshFunction;
      $scope.viewingActivity = formatActivity(activitiesMockData.get()[0]);

      activityPanel = $compile('<div civicase-activity-panel="viewingActivity" refresh-callback="refreshFunction""></div>')($scope);
      $rootScope.$digest();
    }
  });
})(CRM.$, CRM._);
