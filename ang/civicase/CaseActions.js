(function(angular, $, _) {
  angular.module('civicase').directive('civicaseActions', function(crmApi) {
    return {
      restrict: 'A',
      template:
      '<li ng-class="{disabled: !isActionEnabled(action)}" ng-repeat="action in caseActions">' +
      '  <a href ng-click="doAction(action)">{{ action.title }}</a>' +
      '</li>',
      transclude: true,
      link: function($scope, element, attributes) {
        $scope.caseActions = CRM.civicase.caseActions;

        $scope.isActionEnabled = function(action) {
          return (!action.number || $scope.isSelection(action.number));
        };

        // Perform bulk actions
        $scope.doAction = function(action) {
          if (!$scope.isActionEnabled(action)) {
            return;
          }

          $scope.$eval(action.action, {
            cases: $scope.getSelectedCases(),

            deleteCases: function(cases, mode) {
              var msg, trash = 1;
              switch (mode) {
                case 'delete':
                  trash = 0;
                  msg = cases.length === 1 ? ts('Permanently delete selected case? This cannot be undone.') : ts('Permanently delete %1 cases? This cannot be undone.', {'1': cases.length});
                  break;

                case 'restore':
                  msg = cases.length === 1 ? ts('Undelete selected case?') : ts('Undelete %1 cases?', {'1': cases.length});
                  break;

                default:
                  msg = cases.length === 1 ? ts('This case and all associated activities will be moved to the trash.') : ts('%1 cases and all associated activities will be moved to the trash.', {'1': cases.length});
                  mode = 'delete';
              }
              CRM.confirm({title: action.title, message: msg})
                .on('crmConfirm:yes', function() {
                  var calls = [];
                  _.each(cases, function(item) {
                    calls.push(['Case', mode, {id: item.id, move_to_trash: trash}]);
                  });
                  crmApi(calls, true).then($scope.getCases);
                });
            },

            mergeCases: function(cases) {
              var msg = ts('Merge all activitiy records into a single case?');
              if (cases[0].case_type_id !== cases[1].case_type_id) {
                msg += '<br />' + ts('Warning: selected cases are of different types.');
              }
              if (!angular.equals(cases[0].client, cases[1].client)) {
                msg += '<br />' + ts('Warning: selected cases belong to different clients.');
              }
              CRM.confirm({title: action.title, message: msg})
                .on('crmConfirm:yes', function() {
                  crmApi('Case', 'merge', {case_id_1: cases[0].id, case_id_2: cases[1].id}, true).then($scope.getCases);
                });
            },

            changeStatus: function(cases) {
              var types = _.uniq(_.map(cases, 'case_type_id')),
                msg = '<input name="change_case_status" placeholder="' + ts('Select New Status') + '" />',
                statuses = _.map(CRM.civicase.caseStatuses, function(item) {return {id: item.name, text: item.label};});
              _.each(types, function(caseTypeId) {
                var allowedStatuses = CRM.civicase.caseTypes[caseTypeId].definition.statuses || [];
                if (allowedStatuses.length) {
                  _.remove(statuses, function(status) {
                    return allowedStatuses.indexOf(status.id) < 0;
                  });
                }
              });

              CRM.confirm({
                  title: action.title,
                  message: msg,
                  open: function() {
                    $('input[name=change_case_status]', this).crmSelect2({data: statuses});
                  }
                })
                .on('crmConfirm:yes', function() {
                  var status = $('input[name=change_case_status]', this).val(),
                    calls = [];
                  _.each(cases, function(item) {
                    var subject = ts('Case status changed from %1 to %2', {
                      1: item.status,
                      2: _.result(_.find(statuses, {id: status}), 'text')
                    });
                    calls.push(['Case', 'create', {id: item.id, status_id: status}]);
                    calls.push(['Activity', 'create', {case_id: item.id, status_id: 'Completed', activity_type_id: 'Change Case Status', subject: subject}]);
                  });
                  crmApi(calls, true).then($scope.getCases);
                });
            },

            emailManagers: function(cases) {
              var managers = [];
              _.each(cases, function(item) {
                _.each(item.contacts, function(contact) {
                  if (contact.manager) {
                    managers.push(item.manager.contact_id);
                  }
                });
              });
              var url = CRM.url('civicrm/activity/email/add', {
                action: 'add',
                reset: 1,
                atype: _.findKey(activityTypes, {name: 'Email'}),
                cid: _.uniq(managers).join(',')
              });
              CRM.loadForm(url);
            }
          });
        };

        $scope.$watchCollection('filters', function(value) {
          // Special actions when viewing deleted cases
          if (value.is_deleted) {
            $scope.caseActions = [
              {action: 'deleteCases(cases, "delete")', title: ts('Delete Permanently')},
              {action: 'deleteCases(cases, "restore")', title: ts('Restore from Trash')}
            ];
          }
        });
      }
    };
  });
})(angular, CRM.$, CRM._);