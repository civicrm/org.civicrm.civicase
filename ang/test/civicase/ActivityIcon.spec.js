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
        expect(element.hasClass('civicase__activity-icon')).toBe(true);
      });
    });

    describe('email activity type', function () {
      var element;

      beforeEach(function () {
        var emailActivityTypeId;

        _.each(CRM.civicase.activityTypes, function (activty, index) {
          if (activty.name === 'Email') {
            emailActivityTypeId = index;
          }
        });

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
        var inboundActivityTypeId;

        _.each(CRM.civicase.activityTypes, function (activty, index) {
          if (activty.name === 'Inbound Email') {
            inboundActivityTypeId = index;
          }
        });

        $scope.activity = { activity_type_id: inboundActivityTypeId };

        element = $compile('<span activity-icon="activity"></span>')($scope);
        $scope.$digest();
      });

      it('sets the icon arrow direction as down', function () {
        expect(element.isolateScope().direction).toBe('down');
      });
    });
  });
}(CRM._));
