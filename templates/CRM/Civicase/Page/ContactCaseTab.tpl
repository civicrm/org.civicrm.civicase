<div id="civicaseContactTab" >
  <div class="container" ng-view></div>
</div>
{literal}
  <script type="text/javascript">
    (function(angular, $, _) {
      angular.module('civicaseContactTab', ['civicase']);
      angular.module('civicaseContactTab').config(function($routeProvider) {
        $routeProvider.when('/', {
          reloadOnSearch: false,
          template: '<civicase-contact-case></civicase-contact-case>'
        });
      });
    })(angular, CRM.$, CRM._);

    CRM.$(document).one('crmLoad', function(){
      angular.bootstrap(document.getElementById('civicaseContactTab'), ['civicaseContactTab']);
    });
  </script>
{/literal}
