<div id="civicaseActivitiesTab" >
  <div class="container" ng-view></div>
</div>
{literal}
<script type="text/javascript">
  (function(angular, $, _) {
    angular.module('civicaseActivitiesTab', ['civicase']);
    angular.module('civicaseActivitiesTab').config(function($routeProvider) {
      $routeProvider.when('/', {
        controller: function($scope) {
          $scope.filters = {contact_id: {/literal}{$cid|json}{literal}};
        },
        template: '<div id="bootstrap-theme" class="civicase-main" civicase-activity-feed="{filters: filters}"></div>'
      });
    });
  })(angular, CRM.$, CRM._);

  CRM.$(document).one('crmLoad', function(){
    angular.bootstrap(document.getElementById('civicaseActivitiesTab'), ['civicaseActivitiesTab']);
  });
</script>
{/literal}