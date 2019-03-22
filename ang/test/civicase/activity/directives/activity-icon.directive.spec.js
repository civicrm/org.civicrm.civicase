/* eslint-env jasmine */
(function (_) {
  describe('ActivityIcon', function () {
    var $compile, $rootScope, $scope;

    beforeEach(module('civicase.templates', 'civicase'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
    }));

    describe('basic tests', function () {
      var element;

      beforeEach(function () {
        $scope.activity = { activity_type_id: 1 };

        element = $compile('<span activity-icon="activity"></span>')($scope);
        $scope.$digest();
      });

      it('complies the Action directive', function () {
        expect(element.hasClass('civicase__activity-icon-container')).toBe(true);
      });
    });

    describe('email activity type', function () {
      var element;

      beforeEach(function () {
        var emailActivityTypeId = getIDOfActivityType('Email');

        $scope.activity = { activity_type_id: emailActivityTypeId };

        element = $compile('<span activity-icon="activity"></span>')($scope);
        $scope.$digest();
      });

      it('sets the icon arrow direction as up', function () {
        expect(element.isolateScope().direction).toBe('up');
      });
    });

    describe('Inbound Email activity type', function () {
      var element;

      beforeEach(function () {
        var inboundActivityTypeId = getIDOfActivityType('Inbound Email');

        $scope.activity = { activity_type_id: inboundActivityTypeId };

        element = $compile('<span activity-icon="activity"></span>')($scope);
        $scope.$digest();
      });

      it('sets the icon arrow direction as down', function () {
        expect(element.isolateScope().direction).toBe('down');
      });
    });

    /**
     * Get the Activity ID from the Activity Name
     *
     * @param {String} activityName
     * @return {String}
     */
    function getIDOfActivityType (activityName) {
      var activityTypeId;

      // get the id of activity type
      _.each(CRM.civicase.activityTypes, function (activty, index) {
        if (activty.name === activityName) {
          activityTypeId = index;
        }
      });

      return activityTypeId;
    }
  });
}(CRM._));
