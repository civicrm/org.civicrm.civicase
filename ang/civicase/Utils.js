(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.factory('civicaseInteger', function () {
    var myFormat = CRM.visual.d3.format('.3s');
    return function (v) {
      return (v > -1000 & v < 1000) ? Math.round(v) : myFormat(v);
    };
  });

  /** doNutty converts a dc.pieChart() to a stylized donut chart. */
  module.factory('doNutty', function () {
    return function doNutty (chart, totalWidth, statCallback) {
      var legendWidth = Math.floor(totalWidth / 2);
      var radius = Math.floor(totalWidth / 4);
      var padding = 10;
      var thickness = 0.3;

      var legend;

      chart
        .width(legendWidth + (radius * 2))
        .height(radius * 2)
        .innerRadius(Math.floor(radius * (1 - thickness)))
        .cx(radius);

      function moveLegend () {
        var size = chart.group().size();
        legend.gap(padding);
        var legendHeight = (size * legend.itemHeight()) + ((size - 1) * legend.gap());
        legend
          .x(padding + (radius * 2))
          .y((chart.height() - legendHeight) / 2);
        legend.render();
      }

      var g;
      chart
        .on('postRender', function () {
          legend = CRM.visual.dc.legend();
          chart.legend(legend);
          moveLegend();
          var stat = statCallback();
          g = chart.svg()
            .append('g')
            .classed('dc-donutty-label', 'true')
            .attr('transform', 'translate(' + radius + ',' + radius + ')');
          g.append('text')
            .attr('dy', '0em')
            .attr('text-anchor', 'middle')
            .classed('dc-donutty-label-main', 'true')
            .text(stat.number);
          g.append('text')
            .attr('dy', '1em')
            .attr('text-anchor', 'middle')
            .classed('dc-donutty-label-sub', 'true')
            .text(stat.text);
        })
        .on('postRedraw', function () {
          moveLegend();
          if (g) {
            var stat = statCallback();
            g.selectAll('.dc-donutty-label-main').text(stat.number);
            g.selectAll('.dc-donutty-label-sub').text(stat.text);
          }
        });
    };
  });

  module.factory('formatActivity', function (ContactsDataService) {
    var activityTypes = CRM.civicase.activityTypes;
    var activityStatuses = CRM.civicase.activityStatuses;
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = CRM.civicase.caseStatuses;

    return function (act, caseId) {
      act.category = (activityTypes[act.activity_type_id].grouping ? activityTypes[act.activity_type_id].grouping.split(',') : []);
      act.icon = activityTypes[act.activity_type_id].icon;
      act.type = activityTypes[act.activity_type_id].label;
      act.status = activityStatuses[act.status_id].label;
      act.status_name = activityStatuses[act.status_id].name;
      act.status_type = getStatusType(act.status_id);
      act.is_completed = act.status_type !== 'incomplete'; // FIXME doesn't distinguish cancelled from completed
      act.is_overdue = (typeof act.is_overdue === 'string') ? (act.is_overdue === '1') : act.is_overdue;
      act.color = activityStatuses[act.status_id].color || '#42afcb';
      act.status_css = 'status-type-' + act.status_type + ' activity-status-' + act.status_name.toLowerCase().replace(' ', '-');

      if (act.category.indexOf('alert') > -1) {
        act.color = ''; // controlled by css
      }

      if (caseId && (!act.case_id || act.case_id === caseId || _.contains(act.case_id, caseId))) {
        act.case_id = caseId;
      } else if (act.case_id) {
        act.case_id = act.case_id[0];
      } else {
        act.case_id = null;
      }

      if (act['case_id.case_type_id']) {
        act.case = {};

        _.each(act, function (val, key) {
          if (key.indexOf('case_id.') === 0) {
            act.case[key.replace('case_id.', '')] = val;
            delete act[key];
          }
        });

        act.case.client = [];
        act.case.status = caseStatuses[act.case.status_id];
        act.case.type = caseTypes[act.case.case_type_id];

        _.each(act.case.contacts, function (contact) {
          if (!contact.relationship_type_id) {
            act.case.client.push(contact);
          }
          if (contact.manager) {
            act.case.manager = contact;
          }
        });

        delete act.case.contacts;
      }

      return act;
    };
  });

  module.factory('formatCase', function (formatActivity, ContactsDataService) {
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = CRM.civicase.caseStatuses;

    return function (item) {
      item.myRole = [];
      item.client = [];
      item.subject = (typeof item.subject === 'undefined') ? '' : item.subject;
      item.status = caseStatuses[item.status_id].label;
      item.color = caseStatuses[item.status_id].color;
      item.case_type = caseTypes[item.case_type_id].title;
      item.selected = false;
      item.is_deleted = item.is_deleted === '1';

      // Save all activities in a new meaningful key
      if (item['api.Activity.get.1']) {
        item.allActivities = _.each(_.cloneDeep(item['api.Activity.get.1'].values), function (act) {
          formatActivity(act, item.id);
        });

        delete item['api.Activity.get.1'];

        countOverdueTasks(item);
        countIncompleteOtherTasks(item);
      }

      _.each(item.activity_summary, function (activities) {
        _.each(activities, function (act) {
          formatActivity(act, item.id);
        });
      });

      _.each(item, function (field) {
        if (field && typeof field.activity_date_time !== 'undefined') {
          formatActivity(field, item.id);
        }
      });

      _.each(item.contacts, function (contact) {
        if (!contact.relationship_type_id) {
          item.client.push(contact);
        }

        if (contact.contact_id === CRM.config.user_contact_id) {
          item.myRole.push(contact.role);
        }

        if (contact.manager) {
          item.manager = contact;
        }
      });

      return item;
    };

    /**
     * To count overdue tasks.
     *
     * @param {Object} caseObj
     */
    function countOverdueTasks (caseObj) {
      var ifDateInPast, isIncompleteTask, category;
      var otherCategories = ['communication', 'task'];

      caseObj.category_count.overdue = {};

      _.each(caseObj.allActivities, function (val, key) {
        category = CRM.civicase.activityTypes[val.activity_type_id].grouping || 'unlisted';

        ifDateInPast = moment(val.activity_date_time).isBefore(moment());
        isIncompleteTask = CRM.civicase.activityStatusTypes.incomplete.indexOf(parseInt(val.status_id, 10)) > -1;

        if (ifDateInPast && isIncompleteTask) {
          caseObj.category_count.overdue[category] = caseObj.category_count.overdue[category] + 1 || 1;

          if (!_.includes(otherCategories, category)) {
            caseObj.category_count.overdue['other'] = caseObj.category_count.overdue['other'] + 1 || 1;
          }
        }
      });
    }

    /**
     * Accumulates non communication and task counts as
     * other count for incomplete tasks
     *
     * @param {Object} categoryCount - Object of related categoryCount of a case
     */
    function countIncompleteOtherTasks (item) {
      var otherCount;

      _.each(_.keys(item.category_count), function (status) {
        if (status === 'incomplete') {
          otherCount = item.allActivities.filter(function (activity) {
            return CRM.civicase.activityStatusTypes.incomplete.indexOf(parseInt(activity.status_id)) !== -1;
          }).length;

          _.each(_.keys(item.category_count[status]), function (type) {
            if (type === 'communication' || type === 'task') {
              otherCount -= item.category_count[status][type];
            }
            item.category_count[status].other = otherCount;
          });
        }
      });
    }
  });

  module.factory('getActivityFeedUrl', function ($route, $location, $sce) {
    return function (caseId, category, statusType, status, id) {
      caseId = parseInt(caseId, 10);
      var af = {};
      var currentPath = $location.path();
      if (category) {
        af['activity_type_id.grouping'] = category;
      }
      if (statusType) {
        af.status_id = CRM.civicase.activityStatusTypes[statusType];
      }
      if (status) {
        af.status_id = [_.findKey(CRM.civicase.activityStatuses, function (statusObj) {
          return statusObj.name === status;
        })];
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
        p = angular.extend({}, $route.current.params, p);
      }

      // The value to mark as trusted in angular context for security.
      return $sce.trustAsResourceUrl('/case/list?' + $.param(p));
    };
  });

  module.factory('getCaseQueryParams', function () {
    return function getCaseQueryParams (caseId, panelLimit) {
      var activityReturnParams = [
        'subject', 'details', 'activity_type_id', 'status_id', 'source_contact_name',
        'target_contact_name', 'assignee_contact_name', 'activity_date_time', 'is_star',
        'original_id', 'tag_id.name', 'tag_id.description', 'tag_id.color', 'file_id',
        'is_overdue', 'case_id'
      ];
      var allActivitiesParams = {
        case_id: caseId,
        options: {
          limit: '0',
          sort: 'activity_date_time ASC'
        },
        return: activityReturnParams
      };
      var caseReturnParams = [
        'subject', 'details', 'contact_id', 'case_type_id', 'status_id',
        'contacts', 'start_date', 'end_date', 'is_deleted', 'activity_summary',
        'activity_count', 'category_count', 'tag_id.name', 'tag_id.color',
        'tag_id.description', 'tag_id.parent_id', 'related_case_ids'
      ];
      var caseListReturnParams = ['case_type_id', 'start_date', 'end_date', 'status_id', 'contacts', 'subject'];
      var customValuesReturnParams = [
        'custom_group.id', 'custom_group.name', 'custom_group.title',
        'custom_field.name', 'custom_field.label', 'custom_value.display'
      ];
      var relationshipReturnParams = ['id', 'relationship_type_id', 'contact_id_a', 'contact_id_b', 'description', 'start_date'];

      panelLimit = panelLimit || 5;

      return {
        id: caseId,
        return: caseReturnParams,
        // Related cases by contact
        'api.Case.getcaselist.1': {
          contact_id: {IN: '$value.contact_id'},
          id: {'!=': '$value.id'},
          is_deleted: 0,
          return: caseListReturnParams,
          'api.Activity.get.1': allActivitiesParams
        },
        // Linked cases
        'api.Case.getcaselist.2': {
          id: {IN: '$value.related_case_ids'},
          is_deleted: 0,
          return: caseListReturnParams,
          'api.Activity.get.1': allActivitiesParams
        },
        // Gets all the activities for the case
        'api.Activity.get.1': allActivitiesParams,
        // For the "recent communication" panel
        'api.Activity.get.2': {
          case_id: caseId,
          is_current_revision: 1,
          is_test: 0,
          'activity_type_id.grouping': {LIKE: '%communication%'},
          'status_id.filter': 1,
          options: {limit: panelLimit, sort: 'activity_date_time DESC'},
          return: activityReturnParams
        },
        // For the "tasks" panel
        'api.Activity.get.3': {
          case_id: caseId,
          is_current_revision: 1,
          is_test: 0,
          'activity_type_id.grouping': {LIKE: '%task%'},
          'status_id.filter': 0,
          options: {limit: panelLimit, sort: 'activity_date_time ASC'},
          return: activityReturnParams
        },
        // For the "Next Activity" panel
        'api.Activity.get.4': {
          case_id: caseId,
          status_id: {'!=': 'Completed'},
          'activity_type_id.grouping': {'NOT LIKE': '%milestone%'},
          options: {
            limit: 1
          },
          return: activityReturnParams
        },
        // Custom data
        'api.CustomValue.gettree': {
          entity_id: '$value.id',
          entity_type: 'Case',
          return: customValuesReturnParams
        },
        // Relationship description field
        'api.Relationship.get': {
          case_id: caseId,
          is_active: 1,
          return: relationshipReturnParams
        },
        sequential: 1
      };
    };
  });

  module.factory('templateExists', function ($templateCache) {
    return function (templateName) {
      return !!$templateCache.get(templateName);
    };
  });

  // Export a set of civicase-related utility functions.
  // <div civicase-util="myhelper" />
  module.directive('civicaseUtil', function () {
    return {
      restrict: 'EA',
      scope: {
        civicaseUtil: '='
      },
      controller: function ($scope, formatActivity) {
        var util = this;
        util.formatActivity = function (a) { formatActivity(a); return a; };
        util.formatActivities = function (rows) { _.each(rows, formatActivity); return rows; };
        util.isSameDate = function (d1, d2) {
          return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
        };

        $scope.civicaseUtil = this;
      }
    };
  });

  // Angular binding for crm-popup links
  module.directive('crmPopupFormSuccess', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.addClass('crm-popup')
          .on('crmPopupFormSuccess', function (event, element, data) {
            scope.$apply(function () {
              scope.$eval(attrs.crmPopupFormSuccess, {'$event': event, '$data': data});
            });
          });
      }
    };
  });

  // Angular binding for civi ajax form events
  module.directive('crmFormSuccess', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element
          .on('crmFormSuccess', function (event, data) {
            scope.$apply(function () {
              scope.$eval(attrs.crmFormSuccess, {'$event': event, '$data': data});
            });
          });
      }
    };
  });

  // Ex: <div civicase-ui-date-range="model.some_field" />
  module.directive('civicaseUiDateRange', function ($timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        data: '=dateRange'
      },
      templateUrl: '~/civicase/UIDateRange.html',
      controller: 'civicaseUiDateRangeController',
      link: civicaseUiDateRangeLink
    };

    /**
     * Link function for civicaseUiDateRange directive
     *
     * Given that the directive uses crm-ui-datepicker with `time: false`
     * (that is, the user can't select the time manually), it makes sure that,
     * if the `enforce-time` attribute is applied, any selected "from" date is
     * set with the time = 00:00:00 and any selected "to" date with the time = 23:59:59
     *
     * @param {Object} $scope
     * @param {Object} element
     * @param {Object} attrs
     */
    function civicaseUiDateRangeLink ($scope, element, attrs) {
      var enforceTime = attrs.hasOwnProperty('enforceTime');

      // Respond to user interaction with the date widgets
      element.on('change', function (e, context) {
        if (context === 'userInput' || context === 'crmClear') {
          $timeout(function () {
            if ($scope.input.from && $scope.input.to) {
              $scope.data = { BETWEEN: [
                setAsRangeLimit($scope.input.from, 'lower'),
                setAsRangeLimit($scope.input.to, 'upper')
              ] };
            } else if ($scope.input.from) {
              $scope.data = {'>=': setAsRangeLimit($scope.input.from, 'lower')};
            } else if ($scope.input.to) {
              $scope.data = {'<=': setAsRangeLimit($scope.input.to, 'upper')};
            } else {
              $scope.data = null;
            }
          });
        }
      });

      /**
       * Given a date or datetime, it returns it as the lower or upper (depending
       * on the value of the `limit` argument) date range limit
       *
       * If the directive didn't have the `enforce-time` attribute applied, then
       * it will simply return the original value
       *
       * @param {String} dateTime
       *   could be either YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
       * @param {String} [limit="lower"]
       *   whether the datetime should be set as the lower or upper limit
       * @return {String}
       */
      function setAsRangeLimit (dateTime, limit) {
        var date;

        limit = limit !== 'upper' ? 'lower' : limit;
        date = dateTime.split(' ')[0];

        return !enforceTime
          ? date
          : date + ' ' + (limit === 'lower' ? '00:00:00' : '23:59:59');
      }
    }
  });

  /**
   * Controller for civicaseUiDateRange directive
   */
  module.controller('civicaseUiDateRangeController', function ($scope) {
    $scope.ts = CRM.ts('civicase');
    $scope.input = {};

    $scope.$watchCollection('data', function () {
      if (!$scope.data) {
        $scope.input = {};
      } else if ($scope.data.BETWEEN) {
        $scope.input.from = $scope.data.BETWEEN[0];
        $scope.input.to = $scope.data.BETWEEN[1];
      } else if ($scope.data['>=']) {
        $scope.input = {from: $scope.data['>=']};
      } else if ($scope.data['<=']) {
        $scope.input = {to: $scope.data['<=']};
      }
    });
  });

  // Ex: <div crm-ui-number-range="model.some_field" />
  module.directive('crmUiNumberRange', function ($timeout) {
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

        element.addClass('civicase__ui-range');

        // Respond to user interaction with the number widgets
        element.on('change', function () {
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

        scope.$watchCollection('data', function () {
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
  module.directive('crmUiConditional', function () {
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
  module.directive('crmEditable', function ($timeout) {
    return {
      restrict: 'A',
      link: crmEditableLink,
      scope: {
        model: '=crmEditable'
      }
    };

    /**
     * Link function for crmEditable directive
     *
     * @param {object} scope
     * @param {object} elem
     * @param {object} attrs
     */
    function crmEditableLink (scope, elem, attrs) {
      CRM.loadScript(CRM.config.resourceBase + 'js/jquery/jquery.crmEditable.js').done(function () {
        var textarea = elem.data('type') === 'textarea';
        var field = elem.data('field');
        elem
          .html(textarea ? nl2br(getHTMLToShow(scope, elem, attrs)) : _.escape(getHTMLToShow(scope, elem, attrs)))
          .on('crmFormSuccess', function (e, value) {
            $timeout(function () {
              scope.$apply(function () {
                scope.model[field] = value;
              });
            });
          })
          .crmEditable();
        scope.$watchCollection('model', function (model) {
          elem.html(textarea ? nl2br(getHTMLToShow(scope, elem, attrs)) : _.escape(getHTMLToShow(scope, elem, attrs)));
        });
      });
    }

    /**
     * Converts New Line to HTML Break markup
     *
     * @param {String} str
     * @return {String}
     */
    function nl2br (str) {
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
    }

    /**
     * Retuns the text to be shown as HTML,
     * if the model value is null or empty string, retuns the placeholder
     *
     * @param {object} scope
     * @param {object} elem
     * @param {object} attrs
     * @return {String}
     */
    function getHTMLToShow (scope, elem, attrs) {
      var field = elem.data('field');
      var placeholder = attrs.placeholder;

      return (scope.model[field] && scope.model[field] !== '') ? scope.model[field] : placeholder;
    }
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
  module.directive('searchableDropdown', function ($timeout) {
    return {
      restrict: 'C',
      link: function (scope, elem, attrs) {
        $('input', elem)
          .attr('placeholder', '\uF002')
          .click(function (e) {
            e.stopPropagation();
          })
          .keyup(function (e) {
            // Down arrow
            if (e.which === 40) {
              $(this).closest('.searchable-dropdown').next().find('a').first().focus();
            }
          });
        elem.on('click', function () {
          var $input = $('input', this).val('').change();
          $timeout(function () {
            $input.focus();
          }, 100);
        });
      }
    };
  });

  // Editable custom data blocks
  module.directive('civicaseEditCustomData', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var form;

        function close () {
          form.remove();
          elem.show();
          form = null;
        }

        elem
          .addClass('crm-editable-enabled')
          .on('click', function (e) {
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
                .on('crmLoad', function () {
                  // Workaround bug where href="#" changes the angular route
                  $('a.crm-clear-link', form).removeAttr('href');
                })
                .on('crmFormSuccess', function (e, data) {
                  scope.$apply(function () {
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

  module.config(function ($provide) {
    $provide.decorator('crmUiSelectDirective', function ($delegate) {
      var directive = $delegate[0];
      var link = directive.link;

      directive.compile = function () {
        return function (scope, element, attrs) {
          link.apply(this, arguments);

          /**
           * The logic is for disabling chrome autofills. New chrome version needs auto complete to be set to 'new-password'.
           * Refer - https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
           * This should be the part of select 2 library implementation and till this is not implemented in the select2 library,
           * this should be kept here.
           *
           * Todo -
           * Move this logic into crmUiSelect Directive so that this can be implemented for all input single select elements.
           */
          element.siblings('.select2-container').find('input[autocomplete]').attr('autocomplete', 'new-password');
        };
      };

      return $delegate;
    });
  });

  module.service('Contact', function () {
    /**
     * Returns contact id which is currently being viewed
     *
     * @return {String} id of the current user
     */
    this.getContactIDFromUrl = function () {
      var url = new URL(window.location.href);

      return url.searchParams.get('cid') !== null ? url.searchParams.get('cid') : CRM.config.user_contact_id;
    };
  });

  function getStatusType (statusId) {
    var statusType;
    _.each(CRM.civicase.activityStatusTypes, function (statuses, type) {
      if (statuses.indexOf(parseInt(statusId)) >= 0) {
        statusType = type;
      }
    });
    return statusType;
  }
})(angular, CRM.$, CRM._, CRM);
