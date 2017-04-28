(function(angular, $, _) {
  angular.module('civicase').directive('civicaseActions', function() {
    return {
      restrict: 'A',
      template:
      '<li ng-class="{disabled: !isActionEnabled(action)}" ng-if="!action.number || ((multi && action.number > 1) || (!multi && action.number === 1))" ng-repeat="action in caseActions">' +
      '  <a href ng-click="doAction(action)">{{ action.title }}</a>' +
      '</li>',
      scope: {
        cases: '=civicaseActions',
        refresh: '=refreshCallback',
        popupParams: '='
      },
      link: function($scope, element, attributes) {
        $scope.multi = attributes.multiple;

        $scope.isActionEnabled = function(action) {
          return (!action.number || $scope.cases.length == action.number);
        };

        // Perform bulk actions
        $scope.doAction = function(action) {
          if (!$scope.isActionEnabled(action)) {
            return;
          }

          var result = $scope.$eval(action.action, {

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
                  $scope.refresh(calls);
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
                  $scope.refresh([['Case', 'merge', {case_id_1: cases[0].id, case_id_2: cases[1].id}]]);
                });
            },

            changeStatus: function(cases) {
              var types = _.uniq(_.map(cases, 'case_type_id')),
                msg = '<form>' +
                  '<div><input name="change_case_status" placeholder="' + ts('Select New Status') + '" /></div>' +
                  '<label for="change_case_status_details">' + ts('Notes') + '</label>' +
                  '<textarea id="change_case_status_details"></textarea>' +
                  '</form>',
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
                    CRM.wysiwyg.create('#change_case_status_details');
                  }
                })
                .on('crmConfirm:yes', function() {
                  var status = $('input[name=change_case_status]', this).val(),
                    details = $('#change_case_status_details').val(),
                    calls = [];
                  if (status) {
                    _.each(cases, function(item) {
                      var subject = ts('Case status changed from %1 to %2', {
                        1: item.status,
                        2: _.result(_.find(statuses, {id: status}), 'text')
                      });
                      calls.push(['Case', 'create', {id: item.id, status_id: status}]);
                      calls.push(['Activity', 'create', {case_id: item.id, status_id: 'Completed', activity_type_id: 'Change Case Status', subject: subject, details: details}]);
                    });
                    $scope.refresh(calls);
                  }
                });
            },

            emailManagers: function(cases) {
              var managers = [],
                activityTypes = CRM.civicase.activityTypes;
              _.each(cases, function(item) {
                if (item.manager) {
                  managers.push(item.manager.contact_id);
                }
              });
              var popupPath = {
                path: 'civicrm/activity/email/add',
                query: {
                  action: 'add',
                  reset: 1,
                  atype: _.findKey(activityTypes, {name: 'Email'}),
                  cid: _.uniq(managers).join(',')
                }
              };
              if (cases.length === 1) {
                popupPath.query.caseid = cases[0].id;
              }
              return popupPath;
            }
          });

          // Open popup if callback returns a path & query
          if (result) {
            // Add refresh data
            if ($scope.popupParams) {
              result.query.civicase_reload = $scope.popupParams();
            }
            // Mimic the behavior of CRM.popup()
            var formData = false,
              dialog = CRM.loadForm(CRM.url(result.path, result.query))
              // Listen for success events and buffer them so we only trigger once
              .on('crmFormSuccess crmPopupFormSuccess', function(e, data) {
                formData = data;
              })
              .on('dialogclose.crmPopup', function(e, data) {
                if (formData) {
                  element.trigger('crmPopupFormSuccess', [dialog, formData]);
                }
                element.trigger('crmPopupClose', [dialog, data]);
              });
          }
        };

        $scope.$watchCollection('cases', function(cases) {
          // Special actions when viewing deleted cases
          if (cases.length && cases[0].is_deleted) {
            $scope.caseActions = [
              {action: 'deleteCases(cases, "delete")', title: ts('Delete Permanently')},
              {action: 'deleteCases(cases, "restore")', title: ts('Restore from Trash')}
            ];
          } else {
            $scope.caseActions = _.cloneDeep(CRM.civicase.caseActions);
            if (!$scope.multi) {
              _.remove($scope.caseActions, {action: 'changeStatus(cases)'});
            }
          }
        });
      }
    };
  });
})(angular, CRM.$, CRM._);