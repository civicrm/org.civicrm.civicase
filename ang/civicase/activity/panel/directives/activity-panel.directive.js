(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityPanel', function ($rootScope, $timeout, BulkActions) {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/activity/panel/directives/activity-panel.directive.html',
      controller: civicaseActivityPanelController,
      link: civicaseActivityPanelLink,
      scope: {
        activity: '=civicaseActivityPanel',
        refresh: '=refreshCallback'
      }
    };

    /**
     * Link function for civicaseActivityPanelLink
     *
     * @param {Object} $scope
     * @param {Object} element
     */
    function civicaseActivityPanelLink (scope, element, attrs) {
      var ts = CRM.ts('civicase');

      (function init () {
        $timeout(setPanelHeight);
        scope.$on('civicase::activity-feed::show-activity-panel', loadActivityForm);
        element.on('crmFormSuccess', scope.refresh);
        element.on('crmLoad', crmLoadListener);
      }());

      /**
       * Listener for crmLoad event
       */
      function crmLoadListener () {
        // Workaround bug where href="#" changes the angular route
        $('a.crm-clear-link', this).removeAttr('href');
        $('a.delete.button', this).click(onDeleteClickEvent);

        if (!BulkActions.isAllowed()) {
          $('div.crm-submit-buttons').remove();
        }

        // Scrolls the details panel to top once new data loads
        element.scrollTop(0);
      }

      /**
       * Listener for loadActivityForm event
       *
       * @param {object} event
       * @param {object} activity
       */
      function loadActivityForm (event, activity) {
        var context = activity.case_id ? 'case' : 'activity';

        CRM.loadForm(CRM.url('civicrm/activity', {
          action: 'view',
          id: activity.id,
          reset: 1,
          context: context
        }), {target: $(element).find('.civicase__activity-panel__core_container')});

        element.find('.crm-submit-buttons a.edit').addClass('btn btn-primary');
      }

      /**
       * Listener for click event of delete button
       */
      function onDeleteClickEvent () {
        CRM.confirm({
          title: ts('Delete Activity'),
          message: ts('Permanently delete this %1 activity?', {1: scope.activity.type})
        }).on('crmConfirm:yes', function () {
          $(element).children('.civicase__activity-panel__core_container').block();
          CRM.api3('Activity', 'delete', {id: scope.activity.id})
            .done(scope.close)
            .done(scope.refresh);
        });

        return false;
      }

      /**
       * Set height for activity panel
       */
      function setPanelHeight () {
        var $feedBody = $('.civicase__activity-feed__body');
        var $feedPanel = $('.civicase__activity-feed__body__details');
        var topOffset = $feedBody.offset().top + 24;

        $feedPanel.height('calc(100vh - ' + topOffset + 'px)');
      }
    }
  });

  function civicaseActivityPanelController ($scope, $rootScope, dialogService,
    crmApi, crmBlocker, crmStatus, DateHelper) {
    $scope.activityPriorties = CRM.civicase.priority;
    $scope.allowedActivityStatuses = {};
    $scope.closeDetailsPanel = closeDetailsPanel;
    $scope.setStatusTo = setStatusTo;
    $scope.setPriorityTo = setPriorityTo;

    (function init () {
      $scope.$watch('activity.id', showActivityDetails);
      $scope.$on('civicase::case-details::unfocused', closeDetailsPanel);
    }());

    /**
     * Close the activity details panel
     */
    function closeDetailsPanel () {
      delete $scope.activity.id;

      $rootScope.$broadcast('civicase::activity-feed::hide-activity-panel');
    }

    /**
     * Set status of sent activity
     *
     * @param {object} activity
     * @param {object} activityStatusId
     */
    function setStatusTo (activity, activityStatusId) {
      activity.status_id = activityStatusId;
      // Setvalue api avoids messy revisioning issues
      $scope.refresh([['Activity', 'setvalue', {id: activity.id, field: 'status_id', value: activity.status_id}]], true);
    }

    /**
     * Set priority of sent activity
     *
     * @param {object} activity
     * @param {object} priorityId
     */
    function setPriorityTo (activity, priorityId) {
      activity.priority_id = priorityId;
      // Setvalue api avoids messy revisioning issues
      $scope.refresh([['Activity', 'setvalue', {id: activity.id, field: 'priority_id', value: activity.priority_id}]], true);
    }

    /**
     * Set Allowed Activity status's
     */
    function setAllowedActivityStatuses () {
      $scope.allowedActivityStatuses = {};

      _.each(CRM.civicase.activityStatuses, function (activityStatus, activityStatusID) {
        var ifStatusIsInSameCategory = _.intersection($scope.activity.category, activityStatus.grouping.split(',')).length > 0;
        var ifStatusIsInNoneCategory = $scope.activity.category.length === 0 && activityStatus.grouping.split(',').indexOf('none') !== -1;

        if (ifStatusIsInSameCategory || ifStatusIsInNoneCategory) {
          $scope.allowedActivityStatuses[activityStatusID] = activityStatus;
        }
      });
    }

    /**
     * Show activity details
     */
    function showActivityDetails () {
      if ($scope.activity.id) {
        setAllowedActivityStatuses();

        $rootScope.$broadcast('civicase::activity-feed::show-activity-panel', $scope.activity);
      }
    }
  }
})(angular, CRM.$, CRM._);
