(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseContactCaseTabCaseList', function () {
    return {
      restrict: 'EA',
      replace: true,
      controller: CivicaseContactCaseTabCaseListController,
      templateUrl: '~/civicase/ContactCaseTabCaseList.html',
      scope: {
        'caseObj': '='
      }
    };
  });

  function CivicaseContactCaseTabCaseListController ($scope, $rootScope, crmApi, formatCase, DateHelper) {
    var defaultPageSize = 2;

    $scope.loadingPlaceholders = _.range($scope.caseObj.page.size || defaultPageSize);
    $scope.formatDate = DateHelper.formatDate;

    /**
     * Emits loadmore event
     */
    $scope.loadMore = function () {
      $scope.$emit('civicase::contact-record-list::loadmore', $scope.caseObj.name);
    };
  }
})(angular, CRM.$, CRM._);
