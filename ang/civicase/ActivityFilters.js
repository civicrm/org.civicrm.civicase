(function(angular, $, _) {

  function activityFilters($scope, element, attrs) {

    function mapSelectOptions(opt, id) {
      return {
        id: id,
        text: opt.label,
        color: opt.color,
        icon: opt.icon
      };
    }

    $scope.availableFilterSearchText = '';

    $scope.availableFilters = {
      activity_type_id: {
        label: ts('Activity type'),
        html_type: 'Select',
        options: _.map(CRM.civicase.activityTypes, mapSelectOptions)
      },
      status_id: {
        label: ts('Status'),
        html_type: 'Select',
        options: _.map(CRM.civicase.activityStatuses, mapSelectOptions)
      },
      text: {
        label: ts('Contains text'),
        html_type: 'Text'
      },
      target_contact_id: {
        label: ts('With')
      },
      assignee_contact_id: {
        label: ts('Assigned to')
      },
      tag_id: {
        label: ts('Tagged')
      }
    };
    if (_.includes(CRM.config.enableComponents, 'CiviCampaign')) {
      $scope.availableFilters.campaign_id = {
        label: ts('Campaign')
      };
    }
    _.extend($scope.availableFilters, CRM.civicase.customActivityFields);

    $scope.filters = {};

    $scope.exposedFilters = CRM.cache.get('activityFeedFilters', {
      activity_type_id: true,
      status_id: true,
      text: true
    });

    $scope.$watchCollection('exposedFilters', function() {
      CRM.cache.set('activityFeedFilters', $scope.exposedFilters);
      _.each($scope.filters, function(val, key) {
        if (val && !$scope.exposedFilters[key]) {
          delete $scope.filters[key];
        }
      });
    });
  }

  angular.module('civicase').directive('civicaseActivityFilters', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/ActivityFilters.html',
      link: activityFilters,
      transclude: true
    };
  });

})(angular, CRM.$, CRM._);
