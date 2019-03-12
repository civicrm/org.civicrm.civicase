/* eslint-env jasmine */

(function (_) {
  describe('CivicaseCaseListTable Directive', function () {
    var $compile, $rootScope, $scope, originaljQueryHeightFn;

    beforeEach(module('civicase', 'civicase.templates', function ($controllerProvider) {
      $controllerProvider.register('CivicaseCaseListTableController', function () {});
    }));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      $scope = $rootScope.$new();
      $scope.$bindToRoute = jasmine.createSpy('$bindToRoute');

      originaljQueryHeightFn = CRM.$.fn.height;
      spyOn(CRM.$.fn, 'height');
      addAdditionalMarkup();
    }));

    afterEach(function () {
      removeAdditionalMarkup();
      CRM.$.fn.height = originaljQueryHeightFn;
    });

    describe('on init', function () {
      describe('when case is focused', function () {
        beforeEach(function () {
          initDirective();
          $scope.caseIsFocused = true;
          $scope.$digest();
        });

        it('resets the height of the case list', function () {
          expect(CRM.$.fn.height).toHaveBeenCalledWith('auto');
        });
      });

      describe('when not viewing the case', function () {
        beforeEach(function () {
          initDirective();
          $scope.viewingCase = false;
          $scope.$digest();
        });

        it('resets the height of the case list', function () {
          expect(CRM.$.fn.height).toHaveBeenCalledWith('auto');
        });
      });

      describe('when viewing the case and case is not focused', function () {
        var calculatedHeight;

        beforeEach(function () {
          initDirective();
          $scope.viewingCase = true;
          $scope.caseIsFocused = false;
          $scope.$digest();

          var caseList = CRM.$('.civicase__case-list');
          var crmPageTitle = CRM.$('[crm-page-title]');
          var crmPageTitleHeight = crmPageTitle.outerHeight(true);
          var caseListFilterPanel = CRM.$('.civicase__case-filter-panel__form');
          var offsetTop = caseList.offset().top -
            caseListFilterPanel.outerHeight() - crmPageTitleHeight;
          calculatedHeight = 'calc(100vh - ' + offsetTop + 'px)';
        });

        it('sets the height of the case list', function () {
          expect(CRM.$.fn.height).toHaveBeenCalledWith(calculatedHeight);
        });
      });
    });

    /**
     * Initializes the civicaseActivityMonthNav directive
     */
    function initDirective () {
      var html = `<div civicase-case-list-table></div>`;

      $compile(html)($scope);
      $scope.$digest();
    }

    /**
     * Add aditional markup
     */
    function addAdditionalMarkup () {
      var markup = `<div class="civicase-case-list-directive-unit-test" style="height: 50px">
        <div class='civicase__case-list'></div>
        <div crm-page-title></div>
        <div class="civicase__case-filter-panel__form"></div>
      </div>`;

      CRM.$(markup).appendTo('body');
    }

    /**
     * Remove aditional markup
     */
    function removeAdditionalMarkup () {
      CRM.$('.civicase-case-list-directive-unit-test').remove();
    }
  });

  describe('CivicaseCaseListTableController', function () {
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
