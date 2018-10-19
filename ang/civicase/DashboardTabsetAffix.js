(function (angular, $) {
  var module = angular.module('civicase');

  module.directive('civicaseDashboardTabsetAffix', function ($timeout) {
    return {
      link: civicaseDashboardTabsetAffixLink
    };

    function civicaseDashboardTabsetAffixLink (scope) {
      $timeout(function () {
        var $tabNavigation = $('.civicase__dashboard__tab-container ul.nav');
        var $civicrmMenu = $('#civicrm-menu');
        var $toolbarDrawer = $('#toolbar .toolbar-drawer');
        var $tabContainer = $('.civicase__dashboard__tab-container');

        $tabNavigation.affix({
          offset: {
            top: $tabContainer.offset().top - ($toolbarDrawer.height() + $civicrmMenu.height())
          }
        }).on('affixed.bs.affix', function () {
          $tabNavigation.css('top', $civicrmMenu.height() + $toolbarDrawer.height());
        }).on('affixed-top.bs.affix', function () {
          $tabNavigation.css('top', 'auto');
        });
      });
    }
  });
})(angular, CRM.$);
