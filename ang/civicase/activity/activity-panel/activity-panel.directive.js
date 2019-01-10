(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseActivityPanel', function ($rootScope, ActivityPanelMeasurements, BulkActions) {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/activity/activity-panel/activity-panel.directive.html',
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
      var activityPanelMeasurements;
      var ts = CRM.ts('civicase');

      (function init () {
        activityPanelMeasurements = ActivityPanelMeasurements(element);

        setPanelHeight();
        $rootScope.$on('civicase::activity-card::load-activity-form', loadActivityForm);
        element.on('crmFormSuccess', scope.refresh);
        element.on('crmLoad', crmLoadListener);
      }());

      /**
       * Listener for crmLoad event
       */
      function crmLoadListener () {
        setPanelBodyHeight();
        // Workaround bug where href="#" changes the angular route
        $('a.crm-clear-link', this).removeAttr('href');
        $('a.delete.button', this).click(onDeleteClickEvent);

        if (!BulkActions.isAllowed()) {
          $('div.crm-submit-buttons').remove();
        }
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
       * Set height for activity panel
       */
      function setPanelHeight () {
        var topOffset = activityPanelMeasurements.getDistanceFromTop();

        element.height('calc(100vh - ' + topOffset + 'px)');
      }

      /**
       * Set height for activity panel body
       */
      function setPanelBodyHeight () {
        var $panelBody = element.find('.panel-body');
        var bodyTopOffset = activityPanelMeasurements.getPanelBodyTopOffset();

        $panelBody.height('calc(100vh - ' + bodyTopOffset + 'px)');
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
    }
  });

  function civicaseActivityPanelController ($scope, dialogService, crmApi, crmBlocker, crmStatus, DateHelper) {
    $scope.activityPriorties = CRM.civicase.priority;
    $scope.allowedActivityStatuses = {};

    (function init () {
      $scope.$watch('activity.id', showActivityDetails);
    }());

    /**
     * Close the activity details panel
     */
    $scope.closeDetailsPanel = function () {
      delete $scope.activity.id;
    };

    /**
     * Set status of sent activity
     *
     * @param {object} activity
     * @param {object} activityStatusId
     */
    $scope.setStatusTo = function (activity, activityStatusId) {
      activity.status_id = activityStatusId;
      // Setvalue api avoids messy revisioning issues
      $scope.refresh([['Activity', 'setvalue', {id: activity.id, field: 'status_id', value: activity.status_id}]], true);
    };

    /**
     * Set priority of sent activity
     *
     * @param {object} activity
     * @param {object} priorityId
     */
    $scope.setPriorityTo = function (activity, priorityId) {
      activity.priority_id = priorityId;
      // Setvalue api avoids messy revisioning issues
      $scope.refresh([['Activity', 'setvalue', {id: activity.id, field: 'priority_id', value: activity.priority_id}]], true);
    };

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

        $scope.$emit('civicase::activity-card::load-activity-form', $scope.activity);
      }
    }
  }
})(angular, CRM.$, CRM._);
