(function(angular, $, _) {

  angular.module('civicase').directive('civicaseActivityFilters', function($timeout, crmUiHelp) {

    function activityFilters($scope, element, attrs) {
      var ts = $scope.ts = CRM.ts('civicase');
      var hs = $scope.hs = crmUiHelp({file: 'CRM/civicase/ActivityFeed'});

      function mapSelectOptions(opt, id) {
        return {
          id: id,
          text: opt.label,
          color: opt.color,
          icon: opt.icon
        };
      }

      $('.act-feed-panel .panel-header').affix({offset: {top: $('.civicase-view-header').offset().top} });

      $('.act-feed-panel .panel-header').css('top', $('#toolbar').height());
      $('.act-feed-panel .panel-header').on('affixed.bs.affix', function() {
        $('.act-feed-panel .panel-header').css('width',$('.act-feed-panel').css('width'));
        $('.act-feed-panel .panel-header').css('top', $('#toolbar').height());
      });

      $('.act-feed-panel .panel-header').on('affixed-top.bs.affix', function() {
        $('.act-feed-panel .panel-header').css('width','auto');
      });

      $('.toggle.toolbar-toggle-processed').on('click',function() {
        $('.act-feed-panel .panel-header').css('top', $('#toolbar').height());
        $('.act-feed-panel .act-list-controls').css('top',$('#toolbar').height() + $('.act-feed-panel .panel-header').height());
      });

      setTimeout(function() {
        $('.act-feed-panel .act-list-controls').affix({offset: {top: $('.civicase-view-header').offset().top + $('.act-feed-panel .panel-header').height()} });
        
        $('.act-feed-panel .act-list-controls').on('affixed.bs.affix', function() {
          $('.act-feed-panel .act-list-controls').css('width',$('.act-feed-panel .panel-header').css('width'));
          $('.act-feed-panel .act-list-controls').css('top',$('#toolbar').height() + $('.act-feed-panel .panel-header').height());
        });

        $('.act-feed-panel .act-list-controls').on('affixed-top.bs.affix', function() {
          $('.act-feed-panel .act-list-controls').css('width','auto');
          $('.act-feed-panel .act-list-controls').css('top', 'auto');
        });

      }, 1000);




      $scope.availableFilters = [
        {
          name: 'activity_type_id',
          label: ts('Activity type'),
          html_type: 'Select',
          options: _.map(CRM.civicase.activityTypes, mapSelectOptions)
        },
        {
          name: 'status_id',
          label: ts('Status'),
          html_type: 'Select',
          options: _.map(CRM.civicase.activityStatuses, mapSelectOptions)
        },
        {
          name: 'text',
          label: ts('Contains text'),
          html_type: 'Text'
        },
        {
          name: 'target_contact_id',
          label: ts('With'),
          html_type: 'Autocomplete-Select',
          entity: 'Contact'
        },
        {
          name: 'assignee_contact_id',
          label: ts('Assigned to'),
          html_type: 'Autocomplete-Select',
          entity: 'Contact'
        },
        {
          name: 'tag_id',
          label: ts('Tagged'),
          html_type: 'Autocomplete-Select',
          entity: 'Tag',
          api_params: {used_for: {LIKE: '%civicrm_activity%'}}
        }
      ];
      if (_.includes(CRM.config.enableComponents, 'CiviCampaign')) {
        $scope.availableFilters.push({
          name: 'campaign_id',
          label: ts('Campaign'),
          html_type: 'Autocomplete-Select',
          entity: 'Campaign'
        });
      }
      if (CRM.checkPerm('administer CiviCRM')) {
        $scope.availableFilters.push({
          name: 'is_deleted',
          label: ts('Deleted Activities'),
          html_type: 'Select',
          options: [{id: 1, text: ts('Deleted')}, {id: 0, text: ts('Normal')}]
        },
        {
          name: 'is_test',
          label: ts('Test Activities'),
          html_type: 'Select',
          options: [{id: 1, text: ts('Test')}, {id: 0, text: ts('Normal')}]
        });
      }
      $scope.availableFilters = $scope.availableFilters.concat(CRM.civicase.customActivityFields);

      // Default exposed filters
      $scope.exposedFilters = {
        activity_type_id: true,
        status_id: true,
        text: true
      };
      // Ensure set filters are also exposed
      _.each($scope.filters, function(filter, key) {
        $scope.exposedFilters[key] = true;
      });

      $scope.exposeFilter = function(field, $event) {
        var shown = !$scope.exposedFilters[field.name];
        if (shown) {
          // Focus search element when selecting
          $timeout(function () {
            var $span = $('[data-activity-filter=' + field.name + ']', element);
            if ($('[crm-entityref], [crm-ui-select]', $span).length) {
              $('[crm-entityref], [crm-ui-select]', $span).select2('open');
            } else {
              $('input:first', $span).focus();
            }
          }, 50);
        } else {
          // Keep menu open when deselecting
          $event.stopPropagation();
          delete $scope.filters[field.name];
        }
      };

      $scope.hasFilters = function hasFilters() {
        var result = false;
        _.each($scope.filters, function(value){
          if (!_.isEmpty(value)) result = true;
        });
        return result;
      };

      $scope.clearFilters = function clearFilters() {
        _.each(_.keys($scope.filters), function(key){
          delete $scope.filters[key];
        });
      };
    }

    return {
      restrict: 'A',
      scope: {
        filters: '=civicaseActivityFilters'
      },
      templateUrl: '~/civicase/ActivityFilters.html',
      link: activityFilters,
      transclude: true
    };
  });

})(angular, CRM.$, CRM._);
