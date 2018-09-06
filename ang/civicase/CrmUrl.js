/* globals angular, CRM */

(function (angular, CRM) {
  angular.module('civicase').component('crmUrl', {
    bindings: {
      href: '@',
      query: '<'
    },
    controller: crmUrlController,
    controllerAs: 'crmUrl',
    templateUrl: '~/civicase/CrmUrl.html',
    transclude: true
  });

  function crmUrlController () {
    var vm = this;

    /**
     * Returns the URL for the given href and query as provided by the component's
     * bindings and using CRM url to return the link from the base URL.
     *
     * @return {String}
     */
    vm.getHrefLocation = function () {
      return CRM.url(vm.href, vm.query);
    };
  }
})(angular, CRM);
