(function(angular, $, _, CRM) {

  function getStatusType(status_id) {
    var statusType;
    _.each(CRM.civicase.activityStatusTypes, function(statuses, type) {
      if (statuses.indexOf(parseInt(status_id)) >= 0) {
        statusType = type;
      }
    });
    return statusType;
  }

  angular.module('civicase').directive('civicaseSortheader', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        function change() {
          element.toggleClass('sorting', attrs.civicaseSortheader === scope.sortField);
          element.find('i.cc-sort-icon').remove();
          if (attrs.civicaseSortheader === scope.sortField) {
            element.append('<i class="cc-sort-icon fa fa-arrow-circle-' + (scope.sortDir === 'ASC' ? 'up' : 'down') + '"></i>');
          }
        }

        scope.changeSortDir = function() {
          scope.sortDir = (scope.sortDir === 'ASC' ? 'DESC' : 'ASC');
        };

        element
          .addClass('civicase-sortable')
          .on('click', function(e) {
            if ($(e.target).is('th, .cc-sort-icon')) {
              if (scope.sortField === attrs.civicaseSortheader) {
                scope.changeSortDir();
              } else {
                scope.sortField = attrs.civicaseSortheader;
                scope.sortDir = 'ASC';
              }
              scope.$digest();
            }
          });

        scope.$watch('sortField', change);
        scope.$watch('sortDir', change);
      }
    };
  });

  angular.module('civicase').factory('formatActivity', function() {
    var activityTypes = CRM.civicase.activityTypes;
    var activityStatuses = CRM.civicase.activityStatuses;
    return function (act, caseId) {
      act.category = (activityTypes[act.activity_type_id].grouping ? activityTypes[act.activity_type_id].grouping.split(',') : []);
      act.icon = activityTypes[act.activity_type_id].icon;
      act.type = activityTypes[act.activity_type_id].label;
      act.status = activityStatuses[act.status_id].label;
      act.status_name = activityStatuses[act.status_id].name;
      act.status_type = getStatusType(act.status_id);
      act.is_completed = act.status_type !== 'incomplete'; // FIXME doesn't distinguish cancelled from completed
      act.is_overdue = act.is_overdue === '1';
      act.color = activityStatuses[act.status_id].color || '#42afcb';
      act.status_css = 'status-type-' + act.status_type + ' activity-status-' + act.status_name.toLowerCase().replace(' ', '-');
      if (act.category.indexOf('alert') > -1) {
        act.color = ''; // controlled by css
      }
      if (caseId && (!act.case_id || _.contains(act.case_id, caseId))) {
        act.case_id = caseId;
      } else if (act.case_id) {
        act.case_id = act.case_id[0];
      } else {
        act.case_id = null;
      }
    };
  });

  angular.module('civicase').factory('getActivityFeedUrl', function($route, $location) {
    return function(caseId, category, status, id) {
      caseId = parseInt(caseId, 10);
      var af = {},
        currentPath = $location.path();
      if (category) {
        af["activity_type_id.grouping"] = category;
      }
      if (status) {
        af.status_id = CRM.civicase.activityStatusTypes[status];
      }
      var p = {
        caseId: caseId,
        tab: 'activities',
        aid: id || 0,
        focus: 1,
        sx: 0,
        ai: '{"myActivities":false,"delegated":false}',
        af: JSON.stringify(af)
      };
      // If we're not already viewing a case, force the id filter
      if (currentPath !== '/case/list') {
        p.cf = JSON.stringify({id: caseId});
      } else {
        p = _.extend($route.current.params, p);
      }
      return '/case/list?' + $.param(p);
    };
  });

  // Export a set of civicase-related utility functions.
  // <div civicase-util="myhelper" />
  angular.module('civicase').directive('civicaseUtil', function(){
    return {
      restrict: 'EA',
      scope: {
        civicaseUtil: '='
      },
      controller: function ($scope, formatActivity) {
        var util = this;
        util.formatActivity = function(a) {formatActivity(a);return a;};
        util.formatActivities = function(rows) {_.each(rows, formatActivity);return rows;};
        util.isSameDate = function(d1, d2) {
          return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
        };

        $scope.civicaseUtil = this;
      }
    };
  });

  // Angular binding for crm-popup links
  angular.module('civicase').directive('crmPopupFormSuccess', function(){
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.addClass('crm-popup')
          .on('crmPopupFormSuccess', function(event, element, data) {
            scope.$apply(function() {
              scope.$eval(attrs.crmPopupFormSuccess, {"$event": event, "$data": data});
            });
          });
      }
    };
  });
  
  // Angular binding for civi ajax form events
  angular.module('civicase').directive('crmFormSuccess', function(){
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element
          .on('crmFormSuccess', function(event, data) {
            scope.$apply(function() {
              scope.$eval(attrs.crmFormSuccess, {"$event": event, "$data": data});
            });
          });
      }
    };
  });

  // Ex: <div crm-ui-date-range="model.some_field" />
  angular.module('civicase').directive('crmUiDateRange', function($timeout) {
    var ts = CRM.ts('civicase');
    return {
      restrict: 'AE',
      scope: {
        data: '=crmUiDateRange'
      },
      template: '<span><input class="form-control" crm-ui-datepicker="{time: false}" ng-model="input.from" placeholder="' + ts('From') + '" /></span>' +
        '<span><input class="form-control" crm-ui-datepicker="{time: false}" ng-model="input.to" placeholder="' + ts('To') + '" /></span>',
      link: function (scope, element, attrs) {
        scope.input = {};

        element.addClass('crm-ui-range');

        // Respond to user interaction with the date widgets
        element.on('change', function(e, context) {
          if (context === 'userInput' || context === 'crmClear') {
            $timeout(function () {
              if (scope.input.from && scope.input.to) {
                scope.data = {BETWEEN: [scope.input.from, scope.input.to]};
              } else if (scope.input.from) {
                scope.data = {'>=': scope.input.from};
              } else if (scope.input.to) {
                scope.data = {'<=': scope.input.to};
              } else {
                scope.data = null;
              }
            });
          }
        });

        scope.$watchCollection('data', function() {
          if (!scope.data) {
            scope.input = {};
          } else if (scope.data.BETWEEN) {
            scope.input.from = scope.data.BETWEEN[0];
            scope.input.to = scope.data.BETWEEN[1];
          } else if (scope.data['>=']) {
            scope.input = {from: scope.data['>=']};
          } else if (scope.data['<=']) {
            scope.input = {to: scope.data['<=']};
          }
        });
      }
    };
  });

  // Ex: <div crm-ui-number-range="model.some_field" />
  angular.module('civicase').directive('crmUiNumberRange', function($timeout) {
    var ts = CRM.ts('civicase');
    return {
      restrict: 'AE',
      scope: {
        data: '=crmUiNumberRange'
      },
      template: '<span><input class="form-control" type="number" ng-model="input.from" placeholder="' + ts('From') + '" /></span>' +
        '<span><input class="form-control" type="number" ng-model="input.to" placeholder="' + ts('To') + '" /></span>',
      link: function (scope, element, attrs) {
        scope.input = {};

        element.addClass('crm-ui-range');

        // Respond to user interaction with the number widgets
        element.on('change', function() {
          $timeout(function () {
            if (scope.input.from && scope.input.to) {
              scope.data = {BETWEEN: [scope.input.from, scope.input.to]};
            } else if (scope.input.from) {
              scope.data = {'>=': scope.input.from};
            } else if (scope.input.to) {
              scope.data = {'<=': scope.input.to};
            } else {
              scope.data = null;
            }
          });
        });

        scope.$watchCollection('data', function() {
          if (!scope.data) {
            scope.input = {};
          } else if (scope.data.BETWEEN) {
            scope.input.from = scope.data.BETWEEN[0];
            scope.input.to = scope.data.BETWEEN[1];
          } else if (scope.data['>=']) {
            scope.input = {from: scope.data['>=']};
          } else if (scope.data['<=']) {
            scope.input = {to: scope.data['<=']};
          }
        });
      }
    };
  });

  // Ensures that this value is removed from the model when the field is removed via ng-if
  angular.module('civicase').directive('crmUiConditional', function() {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        scope.$on('$destroy', function () {
          var modelAttr = attrs.ngModel || attrs.crmUiDateRange;
          var val = scope.$eval(modelAttr);
          if (typeof val !== 'undefined') {
            scope.$eval(modelAttr + ' = null');
          }
        });
      }
    };
  });

  // Angular binding for CiviCRM's jQuery-based crm-editable
  angular.module('civicase').directive('crmEditable', function($timeout) {
    function nl2br(str) {
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
    }
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        CRM.loadScript(CRM.config.resourceBase + 'js/jquery/jquery.crmEditable.js').done(function () {
          var model = scope.$eval(attrs.crmEditable),
            textarea = elem.data('type') === 'textarea',
            field = elem.data('field');
          elem
            .html(textarea ? nl2br(model[field]) : _.escape(model[field]))
            .on('crmFormSuccess', function(e, value) {
              $timeout(function() {
                scope.$apply(function() {
                  model[field] = value;
                  if (textarea) {
                    elem.html(nl2br(model[field]));
                  }
                });
              });
            })
            .crmEditable();
        });
      }
    };
  });

  // Enhances searchable buttons with the class "searchable-dropdown"
  // Button markup needs to include a label for the button and a search input.
  // Ex:
  // <button type="button" class="btn dropdown-toggle searchable-dropdown" data-toggle="dropdown">
  //   <span><i class="fa fa-plus"></i> {{ ts('Add Item') }}</span>
  //   <input class="form-control" ng-model="itemSearchText" />
  // </button>
  // <ul class="dropdown-menu" >
  //   <li ng-repeat="item in listOfItems | filter:{label: itemSearchText}">...</li>
  // </ul>
  angular.module('civicase').directive('searchableDropdown', function($timeout) {
    return {
      restrict: 'C',
      link: function(scope, elem, attrs) {
        $('input', elem)
          .attr('placeholder', "\uF002")
          .click(function(e) {
            e.stopPropagation();
          })
          .keyup(function(e) {
            // Down arrow
            if (e.which == 40) {
              $(this).closest('.searchable-dropdown').next().find('a').first().focus();
            }
          });
        elem.on('click', function() {
          var $input = $('input', this).val('').change();
          $timeout(function() {
            $input.focus();
          }, 100);
        });
      }
    };
  });

  // Display the list of target/assignee contacts for an activity
  angular.module('civicase').directive('civicaseActivityContacts', function() {
    return {
      restrict: 'A',
      scope: {
        data: '=civicaseActivityContacts'
      },
      link: function (scope, elem, attrs) {
        var contacts = scope.data.activity[scope.data.type + '_contact_name'];
        scope.url = CRM.url;
        scope.contacts = [];
        _.each(contacts, function(name, cid) {
          scope.contacts.push({name: name, cid: cid});
        });
      },
      template:
        '<a ng-if="contacts.length" href="{{ url(\'civicrm/contact/view\', {cid: contacts[0].cid}) }}">{{ contacts[0].name }}</a> ' +
        '<span ng-if="contacts.length === 2">&amp; <a href="{{ url(\'civicrm/contact/view\', {cid: contacts[1].cid}) }}">{{ contacts[1].name }}</a></span>' +
        '<div class="btn-group btn-group-xs" ng-if="contacts.length > 2">' +
        '  <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
        '    + {{ contacts.length - 1 }}' +
        '  </button>' +
        '  <ul class="dropdown-menu" >' +
        '    <li ng-repeat="(index, contact) in contacts" ng-if="index">' +
        '      <a href="{{ url(\'civicrm/contact/view\', {cid: contact.cid}) }}">{{ contact.name }}</a>' +
        '    </li>' +
        '  </ul>' +
        '</div>'
    };
  });

  // Editable custom data blocks
  angular.module('civicase').directive('civicaseEditCustomData', function($timeout) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var form;

        function close() {
          form.remove();
          elem.show();
          form = null;
        }

        elem
          .addClass('crm-editable-enabled')
          .on('click', function(e) {
            if (!form) {
              var url = CRM.url('civicrm/case/cd/edit', {
                cgcount: 1,
                action: 'update',
                reset: 1,
                type: 'Case',
                entityID: scope.item.id,
                groupID: scope.customGroup.id,
                cid: scope.item.client[0].contact_id,
                subType: scope.item.case_type_id,
                civicase_reload: scope.caseGetParams()
              });
              form = $('<div></div>').html(elem.hide().html());
              form.insertAfter(elem)
                .on('click', '.cancel', close)
                .on('crmFormSuccess', function(e, data) {
                  scope.$apply(function() {
                    scope.pushCaseData(data.civicase_reload[0]);
                    close();
                  });
                });
              CRM.loadForm(url, {target: form});
            }
          });
      }
    };
  });

})(angular, CRM.$, CRM._, CRM);
