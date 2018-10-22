(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseTabList', function () {
    return {
      restrict: 'EA',
      replace: true,
      controller: CivicaseContactCaseTabListController,
      templateUrl: '~/civicase/ContactCaseTabList.html',
      scope: {
        'caseObj': '='
      }
    };
  });

  function CivicaseContactCaseTabListController ($scope, $rootScope, crmApi, formatCase, DateHelper) {
    var defaultPageSize = 2;

    $scope.formatDate = DateHelper.formatDate;

    (function init () {
      resetCasesUI();
    }());

    /**
     * Emits loadmore event
     */
    $scope.loadMore = function () {
      $scope.$emit('civicase::contact-record-list::loadmore', $scope.caseObj.name);
    };

    /**
     * resets Cases config UI
     */
    function resetCasesUI () {
      $scope.loadingPlaceholders = _.range($scope.caseObj.page.size || defaultPageSize);
    }
  }
})(angular, CRM.$, CRM._);
