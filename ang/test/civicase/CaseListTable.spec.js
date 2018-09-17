/* eslint-env jasmine */

(function (_) {
  describe('CaseListTable', function () {
    var $scope, crmApi;

    beforeEach(module('civicase', 'crmUtil'));

    beforeEach(inject(function ($controller, $rootScope, _crmApi_) {
      $scope = $rootScope.$new();
      crmApi = _crmApi_;
      // custom function added by civicrm:
      $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');
      $scope.filters = {
        id: _.uniqueId()
      };

      $controller('CivicaseCaseListTableController', {
        $scope: $scope
      });
    }));

    describe('on init', function () {
      it('requests the cases data', function () {
        expect(crmApi).toHaveBeenCalledWith([
          ['Case', 'getcaselist', jasmine.objectContaining({
            'sequential': 1,
            'return': [
              'subject',
              'case_type_id',
              'status_id',
              'is_deleted',
              'start_date',
              'modified_date',
              'contacts',
              'activity_summary',
              'category_count',
              'tag_id.name',
              'tag_id.color',
              'tag_id.description'
            ],
            'options': jasmine.any(Object),
            'api.Activity.get.1': {
              'case_id': '$value.id',
              'return': [
                'activity_type_id',
                'activity_date_time',
                'status_id',
                'is_star',
                'case_id',
                'is_overdue',
                'source_contact_id',
                'target_contact_id',
                'assignee_contact_id'
              ]
            },
            'case_type_id.is_active': 1,
            'id': { 'LIKE': '%' + $scope.filters.id + '%' },
            'contact_is_deleted': 0
          })],
          ['Case', 'getcount', jasmine.objectContaining({
            'case_type_id.is_active': 1,
            'id': { 'LIKE': '%' + $scope.filters.id + '%' },
            'contact_is_deleted': 0
          })],
          ['Case', 'getcaselistheaders']
        ]);
      });
    });
  });
})(CRM._);
