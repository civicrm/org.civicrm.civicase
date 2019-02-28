(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('caseActivityCard', function () {
    return {
      restrict: 'A',
      templateUrl: function (elem, attrs) {
        switch (attrs.mode) {
          case 'big':
            return '~/civicase/activity/card/directives/activity-card-big.directive.html';
          case 'long':
            return '~/civicase/activity/card/directives/activity-card-long.directive.html';
          default:
            return '~/civicase/activity/card/directives/activity-card-short.directive.html';
        }
      },
      controller: caseActivityCardController,
      link: caseActivityCardLink,
      replace: true,
      scope: {
        activity: '=caseActivityCard',
        case: '=?',
        customDropdownClass: '@',
        refresh: '=refreshCallback',
        refreshOnCheckboxToggle: '=?',
        bulkAllowed: '=',
        type: '=type',
        customClickEvent: '='
      }
    };

    /**
     * Link function for caseActivityCard
     *
     * @param {Object} scope
     */
    function caseActivityCardLink (scope) {
      scope.bootstrapThemeElement = $('#bootstrap-theme');
    }
  });

  module.controller('caseActivityCardController', caseActivityCardController);

  function caseActivityCardController ($scope, dialogService, crmApi, crmBlocker, crmStatus, DateHelper) {
    $scope.ts = CRM.ts('civicase');
    $scope.formatDate = DateHelper.formatDate;

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
      var activityFormUrl = activity.case_id
        ? 'civicrm/case/activity'
        : 'civicrm/activity';

      if ($event && $($event.target).is('a, a *, input, button, button *')) {
        return;
      }

      CRM.loadForm(CRM.url(activityFormUrl, {
        action: 'update',
        id: activity.id,
        caseid: activity.case_id,
        reset: 1
      })).on('crmFormSuccess', function () {
        $scope.refresh();
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
  }
})(angular, CRM.$, CRM._);
