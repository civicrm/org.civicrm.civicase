/* eslint-env jasmine */

(function (_) {
  describe('CaseListTable', function () {
    var $controller, $q, $scope, CasesData, crmApi;

    beforeEach(module('civicase', 'civicase.data', 'crmUtil'));

    beforeEach(inject(function (_$controller_, _$q_, $rootScope, _CasesData_, _crmApi_,
      _formatCase_) {
      $controller = _$controller_;
      $q = _$q_;
      $scope = $rootScope.$new();
      CasesData = _CasesData_.get();
      crmApi = _crmApi_;
      // custom function added by civicrm:
      $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');
      $scope.filters = {
        id: _.uniqueId()
      };
    }));
    describe('on calling applyAdvSearch()', function () {
      var expectedApiCallParams;

      beforeEach(function () {
        expectedApiCallParams = [
          ['Case', 'getcaselist', jasmine.objectContaining({
            'sequential': 1,
            return: [
              'subject', 'case_type_id', 'status_id', 'is_deleted', 'start_date',
              'modified_date', 'contacts', 'activity_summary', 'category_count',
              'tag_id.name', 'tag_id.color', 'tag_id.description'
            ],
            'options': jasmine.any(Object),
            'api.Activity.get.1': {
              'case_id': '$value.id',
              'options': jasmine.objectContaining({
                'sort': 'activity_date_time ASC'
              }),
              return: [
                'subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name',
                'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star',
                'original_id', 'tag_id.name', 'tag_id.description', 'tag_id.color', 'file_id',
                'is_overdue', 'case_id'
              ]
            },
            'case_type_id.is_active': 1,
            'id': { 'LIKE': '%' + $scope.filters.id + '%' },
            'contact_is_deleted': 0
          })],
          ['Case', 'getdetailscount', jasmine.objectContaining({
            'case_type_id.is_active': 1,
            'id': { 'LIKE': '%' + $scope.filters.id + '%' },
            'contact_is_deleted': 0
          })],
          ['Case', 'getcaselistheaders']
        ];

        crmApi.and.returnValue($q.resolve([_.cloneDeep(CasesData)]));
        initController();
        $scope.applyAdvSearch($scope.filters);
      });

      it('requests the cases data', function () {
        expect(crmApi).toHaveBeenCalledWith(expectedApiCallParams);
      });
    });

    /**
     * Initializes the case list table controller.
     */
    function initController () {
      $controller('CivicaseCaseListTableController', {
        $scope: $scope
      });
    }
  });
})(CRM._);
