<div id="civicaseActivitiesTab" >
  <div class="container" ng-view></div>
</div>
{literal}
<script type="text/javascript">
  (function(angular, $, _) {
    angular.module('civicaseActivitiesTab', ['civicase']);
    angular.module('civicaseActivitiesTab').config(function($routeProvider) {
      $routeProvider.when('/', {
        reloadOnSearch: false,
        controller: function($scope) {
          $scope.filters = {contact_id: {/literal}{$cid|json}{literal}};
          $scope.displayOptions = {include_case: false};
        },
        template: '<div id="bootstrap-theme"' +
          'class="civicase__container"' +
          'hide-quick-nav-when-details-is-visible="true"' +
          'show-bulk-actions="true"' +
          'civicase-activity-feed="{filters: filters, displayOptions: displayOptions}"></div>'
      });
    });
  })(angular, CRM.$, CRM._);

  CRM.$(document).one('crmLoad', function(){
    angular.bootstrap(document.getElementById('civicaseActivitiesTab'), ['civicaseActivitiesTab']);
  });
</script>
{/literal}
