{if $related_cids}
<div id="civicaseRelatedContactTab" >
{else}
<div id="civicaseContactTab" >
{/if}
  <div class="container" ng-view></div>
</div>
{literal}
  <script type="text/javascript">
    (function(angular, $, _) {
      angular.module('civicaseContactTab', ['civicase']);
      angular.module('civicaseContactTab').config(function($routeProvider) {
        $routeProvider.when('/', {
          reloadOnSearch: false,
          resolve: {
            hiddenFilters: function() {
              var ret = {
                  "contact_id": [{/literal}{$cid|json}{literal}]
              };
              {/literal}
              {if $related_cids}
              {literal}
                var rcids = [{/literal}{$related_cids|json}{literal}];
                ret["related_cids"] = rcids.toString().split(',');
              {/literal}
              {/if}
              {literal}
              return ret;
            }
          },
          controller: 'CivicaseCaseList',
          templateUrl: '~/civicase/CaseList.html'
        });
      });
    })(angular, CRM.$, CRM._);

    CRM.$(document).one('crmLoad', function(){
      {/literal}
      {if $related_cids}
      {literal}
      var caseTab = document.getElementById('civicaseRelatedContactTab');
      {/literal}
      {else}
      {literal}
      var caseTab = document.getElementById('civicaseContactTab');
      {/literal}
      {/if}
      {literal}
      angular.bootstrap(caseTab, ['civicaseContactTab']);
    });
  </script>
{/literal}