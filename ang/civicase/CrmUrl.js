/* globals angular, CRM */

(function (angular, CRM) {
  angular.module('civicase').component('crmUrl', {
    bindings: {
      href: '@',
      query: '<'
    },
    controller: crmUrlController,
    controllerAs: 'crmUrl',
    replace: true,
    templateUrl: '~/civicase/CrmUrl.html',
    transclude: true
  });

  function crmUrlController () {
    var vm = this;

    vm.getHrefLocation = function () {
      return CRM.url(vm.href, vm.query);
    };
  }
})(angular, CRM);
