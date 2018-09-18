/* eslint-env jasmine */

(function (_) {
  describe('CaseListTable', function () {
    var $controller, $q, $scope, CasesData, crmApi, formatCase;

    beforeEach(module('civicase', 'civicase.data', 'crmUtil'));

    beforeEach(inject(function (_$controller_, _$q_, $rootScope, _CasesData_, _crmApi_,
      _formatCase_) {
      $controller = _$controller_;
      $q = _$q_;
      $scope = $rootScope.$new();
      CasesData = _CasesData_;
      crmApi = _crmApi_;
      formatCase = _formatCase_;
      // custom function added by civicrm:
      $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');
      $scope.filters = {
        id: _.uniqueId()
      };
    }));

    describe('on init', function () {
      var expectedApiCallParams, expectedCases;

      beforeEach(function () {
        expectedApiCallParams = [
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
        ];

        crmApi.and.returnValue($q.resolve([_.cloneDeep(CasesData)]));
        expectedCases = _.chain(CasesData.values).cloneDeep().map(formatCase).value();
        initController();
        $scope.$digest();
      });

      it('requests the cases data', function () {
        expect(crmApi).toHaveBeenCalledWith(expectedApiCallParams);
      });

      it('stores the cases after formatting them', function () {
        expect($scope.cases).toEqual(expectedCases);
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
