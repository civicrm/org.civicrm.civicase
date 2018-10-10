(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('caseActivityCard', function ($rootScope) {
    return {
      restrict: 'A',
      templateUrl: function (elem, attrs) {
        switch (attrs.mode) {
          case 'details-panel':
            return '~/civicase/ActivityCard--Details.html';
          case 'big':
            return '~/civicase/ActivityCard--Big.html';
          case 'long':
            return '~/civicase/ActivityCard--Long.html';
          default:
            return '~/civicase/ActivityCard--Short.html';
        }
      },
      controller: caseActivityCardController,
      link: caseActivityCardLink,
      replace: true,
      scope: {
        activity: '=caseActivityCard',
        case: '=?',
        customDropdownClass: '@',
        mode: '@',
        refresh: '=refreshCallback',
        refreshOnCheckboxToggle: '=?',
        bulkAllowed: '=',
        editActivityUrl: '=?editActivityUrl',
        type: '=type',
        customClickEvent: '='
      }
    };

    /**
     * Link function for caseActivityCard
     *
     * @param {Object} $scope
     * @param {Object} element
     */
    function caseActivityCardLink (scope, element, attrs) {
      var ts = CRM.ts('civicase');
      scope.bootstrapThemeElement = $('#bootstrap-theme');

      (function init () {
        if (scope.mode === 'details-panel') {
          $rootScope.$on('civicase::activity-card::load-activity-form', loadActivityForm);
          element.on('crmFormSuccess', scope.refresh);
          element.on('crmLoad', crmLoadListener);
        }
      }());

      /**
       * Listener for crmLoad event
       */
      function crmLoadListener () {
        // Workaround bug where href="#" changes the angular route
        $('a.crm-clear-link', this).removeAttr('href');
        $('a.delete.button', this).click(function (e) {
          CRM.confirm({
            title: ts('Delete Activity'),
            message: ts('Permanently delete this %1 activity?', {1: scope.activity.type})
          })
            .on('crmConfirm:yes', function () {
              $(element).children('div.civicase__activity-card--details-panel__container').block();
              CRM.api3('Activity', 'delete', {id: scope.activity.id})
                .done(scope.close)
                .done(scope.refresh);
            });
          return false;
        });

        if (CRM.checkPerm('basic case information') &&
          !CRM.checkPerm('administer CiviCase') &&
          !CRM.checkPerm('access my cases and activities') &&
          !CRM.checkPerm('access all cases and activities')
        ) {
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
        }), {target: $(element).find('div.civicase__activity-card--details-panel__container')});

        element.find('.crm-submit-buttons a.edit').addClass('btn btn-primary');
      }
    }
  });

  function caseActivityCardController ($scope, getActivityFeedUrl, dialogService, templateExists, crmApi, crmBlocker, crmStatus, DateHelper) {
    var ts = $scope.ts = CRM.ts('civicase');
    $scope.activityFeedUrl = getActivityFeedUrl;
    $scope.activityPriorties = CRM.civicase.priority;
    $scope.allowedActivityStatuses = {};
    $scope.templateExists = templateExists;
    $scope.formatDate = DateHelper.formatDate;

    (function init () {
      if ($scope.mode === 'details-panel') {
        $scope.$watch('activity.id', showActivityDetails);
      }
    }());

    /**
     * Close the activity details panel
     */
    $scope.closeDetailsPanel = function () {
      delete $scope.activity.id;
    };

    $scope.isActivityEditable = function (activity) {
      var type = CRM.civicase.activityTypes[activity.activity_type_id].name;

      return (type !== 'Email' && type !== 'Print PDF Letter') && $scope.editActivityUrl;
    };

    /**
     * Mark an activity as complete
     *
     * @param {object} activity
     */
    $scope.markCompleted = function (activity) {
      return crmApi([['Activity', 'create', {id: activity.id, status_id: activity.is_completed ? 'Scheduled' : 'Completed'}]])
        .then(function (data) {
          if (!data[0].is_error) {
            activity.is_completed = !activity.is_completed;
            $scope.refreshOnCheckboxToggle && $scope.refresh();
          }
        });
    };

    /**
     * Toggle an activity as favourite
     *
     * @param {object} $event
     * @param {object} activity
     */
    $scope.toggleActivityStar = function ($event, activity) {
      $event.stopPropagation();
      activity.is_star = activity.is_star === '1' ? '0' : '1';
      // Setvalue api avoids messy revisioning issues
      $scope.refresh([['Activity', 'setvalue', {id: activity.id, field: 'is_star', value: activity.is_star}]], true);
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
     * Delete an activity
     *
     * @param {object} activity
     * @param {jQuery} dialog - the dialog which should be closed once deletion is over
     */
    $scope.deleteActivity = function (activity, dialog) {
      CRM.confirm({
        title: ts('Delete Activity'),
        message: ts('Permanently delete this %1 activity?', {1: activity.type})
      })
        .on('crmConfirm:yes', function () {
          $scope.refresh([['Activity', 'delete', {id: activity.id}]]);
          if (dialog && $(dialog).data('uiDialog')) {
            $(dialog).dialog('close');
          }
        });
    };

    /**
     * Click handler for Activity Card
     *
     * @param {object} $event
     * @param {object} activity
     */
    $scope.viewActivityDetails = function ($event, activity) {
      if ($scope.customClickEvent) {
        $scope.$emit('civicaseAcitivityClicked', $event, activity);
      } else {
        $scope.viewInPopup($event, activity);
      }
    };

    /**
     * View the sent activity details in the popup
     *
     * @param {object} $event
     * @param {object} activity
     */
    $scope.viewInPopup = function ($event, activity) {
      if (!$event || !$($event.target).is('a, a *, input, button, button *')) {
        var context = activity.case_id ? 'case' : 'activity';
        var form = CRM.loadForm(CRM.url('civicrm/activity', {action: 'view', id: activity.id, reset: 1, context: context}))
          .on('crmFormSuccess', function () {
            $scope.refresh();
          })
          .on('crmLoad', function () {
            $('a.delete.button').click(function () {
              $scope.deleteActivity(activity, form);

              return false;
            });
          });
      }
    };

    $scope.moveCopyActivity = function (act, op) {
      var model = {
        ts: ts,
        activity: _.cloneDeep(act)
      };
      dialogService.open('MoveCopyActCard', '~/civicase/ActivityMoveCopy.html', model, {
        autoOpen: false,
        height: 'auto',
        width: '40%',
        title: op === 'move' ? ts('Move %1 Activity', {1: act.type}) : ts('Copy %1 Activity', {1: act.type}),
        buttons: [{
          text: ts('Save'),
          icons: {primary: 'fa-check'},
          click: function () {
            if (op === 'copy') {
              delete model.activity.id;
            }
            if (model.activity.case_id && model.activity.case_id !== act.case_id) {
              $scope.refresh([['Activity', 'create', model.activity]]);
            }
            $(this).dialog('close');
          }
        }]
      });
    };

    /**
     * Gets attachments for an activity
     *
     * @param {object} activity
     */
    $scope.getAttachments = function (activity) {
      if (!activity.attachments) {
        activity.attachments = [];
        CRM.api3('Attachment', 'get', {
          entity_table: 'civicrm_activity',
          entity_id: activity.id,
          sequential: 1
        }).done(function (data) {
          activity.attachments = data.values;
          $scope.$digest();
        });
      }

      /**
       * Deletes file of an activity
       *
       * @params {Object} activity
       * @params {Object} file
       */
      $scope.deleteFile = function (activity, file) {
        var p = crmApi('Attachment', 'delete', {id: file.id})
          .then(function () {
            $scope.refresh();
          });
        return crmBlocker(crmStatus({start: $scope.ts('Deleting...'), success: $scope.ts('Deleted')}, p));
      };
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
     * Show activity details in
     */
    function showActivityDetails () {
      if ($scope.activity.id) {
        setAllowedActivityStatuses();

        $scope.$emit('civicase::activity-card::load-activity-form', $scope.activity);
      }
    }
  }
})(angular, CRM.$, CRM._);
