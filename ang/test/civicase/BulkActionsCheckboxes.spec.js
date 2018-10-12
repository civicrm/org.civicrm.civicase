/* eslint-env jasmine */

describe('BulkActionsCheckboxes', function () {
  var $compile, $rootScope, $scope, element;

  beforeEach(module('civicase', 'civicase.templates'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  beforeEach(function () {
    compileDirective();
  });

  describe('basic tests', function () {
    it('complies the BulkActionsCheckboxes directive', function () {
      expect(element.html()).toContain('civicase__bulkactions-checkbox');
    });
  });

  describe('showCheckboxes', function () {
    describe('showCheckboxes is true', function () {
      beforeEach(function () {
        $scope.showCheckboxes = true;
        $scope.$digest();
      });

      it('adds civicase__bulkactions-checkbox-toggle--show class to the checkbox', function () {
        expect(element.find('.civicase__bulkactions-checkbox-toggle').hasClass('civicase__bulkactions-checkbox-toggle--show')).toBe(true);
      });
    });
    describe('showCheckboxes is false', function () {
      beforeEach(function () {
        $scope.showCheckboxes = false;
        $scope.$digest();
      });

      it('do not add civicase__bulkactions-checkbox-toggle--show class to the checkbox', function () {
        expect(element.find('.civicase__bulkactions-checkbox-toggle').hasClass('civicase__bulkactions-checkbox-toggle--show')).toBe(false);
      });
    });
  });

  describe('isSelectAllAvailable', function () {
    describe('isSelectAllAvailable is true', function () {
      beforeEach(function () {
        $scope.isSelectAllAvailable = true;
        $scope.$digest();
      });

      it('do not adds civicase__link-disabled class to the link', function () {
        expect(element.find('a[ng-disabled="!isSelectAllAvailable"]').hasClass('civicase__link-disabled')).toBe(false);
      });
    });
    describe('isSelectAllAvailable is false', function () {
      beforeEach(function () {
        $scope.isSelectAllAvailable = false;
        $scope.$digest();
      });

      it('add civicase__bulkactions-checkbox-toggle--show class', function () {
        expect(element.find('a[ng-disabled="!isSelectAllAvailable"]').hasClass('civicase__link-disabled')).toBe(true);
      });
    });
  });

  describe('toggleCheckbox()', function () {
    describe('when showCheckboxes is true', function () {
      beforeEach(function () {
        element.isolateScope().showCheckboxes = true;
        element.isolateScope().toggleCheckbox();
      });

      it('makes showCheckboxes false', function () {
        expect(element.isolateScope().showCheckboxes).toBe(false);
      });
    });
    describe('when showCheckboxes is false', function () {
      beforeEach(function () {
        element.isolateScope().showCheckboxes = false;
        element.isolateScope().toggleCheckbox();
      });

      it('makes showCheckboxes true', function () {
        expect(element.isolateScope().showCheckboxes).toBe(true);
      });
    });
  });

  describe('select()', function () {
    var originalEmitFunction;

    beforeEach(function () {
      originalEmitFunction = element.isolateScope().$emit;
      element.isolateScope().$emit = jasmine.createSpy('$emit');
    });

    afterEach(function () {
      element.isolateScope().$emit = originalEmitFunction;
    });

    describe('called for all selection', function () {
      beforeEach(function () {
        element.isolateScope().select('all');
      });

      it('emits bulkSelection event with "all" parameter', function () {
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('bulkSelection', 'all');
      });
    });

    describe('called for visible selection', function () {
      beforeEach(function () {
        element.isolateScope().select('visible');
      });

      it('emits bulkSelection event with "visible" parameter', function () {
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('bulkSelection', 'visible');
      });
    });

    describe('called for deselect all', function () {
      beforeEach(function () {
        element.isolateScope().select('none');
      });

      it('emits bulkSelection event with "none" parameter', function () {
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('bulkSelection', 'none');
      });
    });
  });

  /**
   * Function responsible for setting up compilation of the directive
   */
  function compileDirective () {
    $scope.selectedCasesLength = 10;
    $scope.showCheckboxes = true;
    $scope.isSelectAllAvailable = false;
    element = $compile('<div civicase-bulk-actions-checkboxes show-checkboxes="showCheckboxes" is-select-all-available="isSelectAllAvailable" selected-items="selectedCasesLength"></div>')($scope);
    $scope.$digest();
  }
});
