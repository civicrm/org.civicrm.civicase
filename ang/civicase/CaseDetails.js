(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseDetails', function () {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/CaseDetails.html',
      controller: 'civicaseCaseDetailsController',
      scope: {
        activeTab: '=civicaseTab',
        isFocused: '=civicaseFocused',
        item: '=civicaseCaseDetails'
      }
    };
  });

  module.controller('civicaseCaseDetailsController', civicaseCaseDetailsController);

  function civicaseCaseDetailsController ($scope, crmApi, formatActivity, formatCase, getActivityFeedUrl, $route, $timeout) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = $scope.caseStatuses = CRM.civicase.caseStatuses;
    var activityTypes = $scope.activityTypes = CRM.civicase.activityTypes;
    var panelLimit = 5;

    $scope.activityFeedUrl = getActivityFeedUrl;
    $scope.caseTypesLength = _.size(caseTypes);
    $scope.CRM = CRM;
    $scope.item = null;
    $scope.tabs = [
      {name: 'summary', label: ts('Summary')},
      {name: 'activities', label: ts('Activities')},
      {name: 'people', label: ts('People')},
      {name: 'files', label: ts('Files')}
    ];

    (function init () {
      $scope.$watch('isFocused', isFocusedWatcher);
      $scope.$watch('item', itemWatcher);
    }());

    $scope.addTimeline = function (name) {
      $scope.refresh([['Case', 'addtimeline', {case_id: $scope.item.id, 'timeline': name}]]);
    };

    $scope.caseGetParams = function () {
      return JSON.stringify(caseGetParams());
    };

    $scope.editActivityUrl = function (id) {
      return CRM.url('civicrm/case/activity', {
        action: 'update',
        reset: 1,
        cid: $scope.item.client[0].contact_id,
        caseid: $scope.item.id,
        id: id,
        civicase_reload: $scope.caseGetParams()
      });
    };

    /**
     * Toggle focus of the Summary View
     */
    $scope.focusToggle = function () {
      $scope.isFocused = !$scope.isFocused;
    };

    /**
     * Formats Date in given format
     *
     * @param {String} date ISO string
     * @param {String} format Date format
     * @return {String} the formatted date
     */
    $scope.formatDate = function (date, format) {
      return moment(date).format(format);
    };

    $scope.getActivityType = function (name) {
      return _.findKey(activityTypes, {name: name});
    };

    $scope.gotoCase = function (item, $event) {
      if ($event && $($event.target).is('a, a *, input, button, button *')) {
        return;
      }
      var cf = {
        case_type_id: [caseTypes[item.case_type_id].name],
        status_id: [caseStatuses[item.status_id].name]
      };
      var p = angular.extend({}, $route.current.params, {caseId: item.id, cf: JSON.stringify(cf)});
      $route.updateParams(p);
    };

    // Copied from ActivityList.js - used by the Recent Communication panel
    $scope.isSameDate = function (d1, d2) {
      return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
    };

    $scope.markCompleted = function (act) {
      $scope.refresh([['Activity', 'create', {id: act.id, status_id: act.is_completed ? 'Scheduled' : 'Completed'}]]);
    };

    $scope.newActivityUrl = function (actType) {
      var path = 'civicrm/case/activity';
      var args = {
        action: 'add',
        reset: 1,
        cid: $scope.item.client[0].contact_id,
        caseid: $scope.item.id,
        atype: actType.id,
        civicase_reload: $scope.caseGetParams()
      };

      // CiviCRM requires nonstandard urls for a couple special activity types
      if (actType.name === 'Email') {
        path = 'civicrm/activity/email/add';
        args.context = 'standalone';
        delete args.cid;
      }
      if (actType.name === 'Print PDF Letter') {
        path = 'civicrm/activity/pdf/add';
        args.context = 'standalone';
      }
      return CRM.url(path, args);
    };

    // Create activity when changing case subject
    $scope.onChangeSubject = function (newSubject) {
      CRM.api3('Activity', 'create', {
        case_id: $scope.item.id,
        activity_type_id: 'Change Case Subject',
        subject: newSubject,
        status_id: 'Completed'
      });
    };

    $scope.panelPlaceholders = function (num) {
      return _.range(num > panelLimit ? panelLimit : num);
    };

    $scope.pushCaseData = function (data) {
      // If the user has already clicked through to another case by the time we get this data back, stop.
      if ($scope.item && data.id === $scope.item.id) {
        // Maintain the reference to the variable in the parent scope.
        delete ($scope.item.tag_id);
        _.assign($scope.item, formatCaseDetails(data));
        countScheduledActivities();
        $scope.allowedCaseStatuses = getAllowedCaseStatuses($scope.item.definition);
        $scope.availableActivityTypes = getAvailableActivityTypes($scope.item.activity_count, $scope.item.definition);
        $scope.$broadcast('updateCaseData');
      }
    };

    $scope.refresh = function (apiCalls) {
      if (!_.isArray(apiCalls)) apiCalls = [];
      apiCalls.push(['Case', 'getdetails', caseGetParams()]);
      crmApi(apiCalls, true).then(function (result) {
        $scope.pushCaseData(result[apiCalls.length - 1].values[0]);
      });
    };

    $scope.selectTab = function (tab) {
      $scope.activeTab = tab;
      if (typeof $scope.isFocused === 'boolean') {
        $scope.isFocused = true;
      }
    };

    $scope.viewActivityUrl = function (id) {
      return CRM.url('civicrm/case/activity', {
        action: 'update',
        reset: 1,
        cid: $scope.item.client[0].contact_id,
        caseid: $scope.item.id,
        id: id,
        civicase_reload: $scope.caseGetParams()
      });
    };

    function caseGetParams () {
      return {
        id: $scope.item.id,
        return: ['subject', 'details', 'contact_id', 'case_type_id', 'status_id', 'contacts', 'start_date', 'end_date', 'is_deleted', 'activity_summary', 'activity_count', 'category_count', 'tag_id.name', 'tag_id.color', 'tag_id.description', 'tag_id.parent_id', 'related_case_ids'],
        // Related cases by contact
        'api.Case.get.1': {
          contact_id: {IN: '$value.contact_id'},
          id: {'!=': '$value.id'},
          is_deleted: 0,
          return: ['case_type_id', 'start_date', 'end_date', 'status_id', 'contacts', 'subject']
        },
        // Linked cases
        'api.Case.get.2': {
          id: {IN: '$value.related_case_ids'},
          is_deleted: 0,
          return: ['case_type_id', 'start_date', 'end_date', 'status_id', 'contacts', 'subject']
        },
        // To get the count of overdue tasks
        'api.Activity.get.1': {},
        // For the "recent communication" panel
        'api.Activity.get.2': {
          case_id: '$value.id',
          is_current_revision: 1,
          is_test: 0,
          'activity_type_id.grouping': {LIKE: '%communication%'},
          'status_id.filter': 1,
          options: {limit: panelLimit, sort: 'activity_date_time DESC'},
          return: ['activity_type_id', 'subject', 'activity_date_time', 'status_id', 'target_contact_name', 'assignee_contact_name', 'is_overdue', 'is_star', 'file_id']
        },
        // For the "tasks" panel
        'api.Activity.get.3': {
          case_id: '$value.id',
          is_current_revision: 1,
          is_test: 0,
          'activity_type_id.grouping': {LIKE: '%task%'},
          'status_id.filter': 0,
          options: {limit: panelLimit, sort: 'activity_date_time ASC'},
          return: ['activity_type_id', 'subject', 'activity_date_time', 'status_id', 'target_contact_name', 'assignee_contact_name', 'is_overdue', 'is_star', 'file_id']
        },
        // Custom data
        'api.CustomValue.gettree': {
          entity_id: '$value.id',
          entity_type: 'Case',
          return: ['custom_group.id', 'custom_group.name', 'custom_group.title', 'custom_field.name', 'custom_field.label', 'custom_value.display']
        },
        // Relationship description field
        'api.Relationship.get': {
          case_id: '$value.id',
          is_active: 1,
          return: ['id', 'relationship_type_id', 'contact_id_a', 'contact_id_b', 'description']
        },
        sequential: 1
      };
    }

    /**
     * Counts the Scheduled Activities and the overdues
     */
    function countScheduledActivities () {
      var status, ifDateInPast;
      var scheduled = { count: 0, overdue: 0 };

      _.each($scope.item.allActivities, function (val, key) {
        status = CRM.civicase.activityStatuses[val.status_id];

        if (status.label === 'Scheduled') {
          scheduled.count++;

          ifDateInPast = moment(val.activity_date_time).isBefore(moment());
          if (ifDateInPast) {
            scheduled.overdue++;
          }
        }
      });
      $scope.item.category_count.scheduled = scheduled;
    }

    function formatAct (act) {
      return formatActivity(act, $scope.item.id);
    }

    function formatCaseDetails (item) {
      formatCase(item);
      item.definition = caseTypes[item.case_type_id].definition;
      item.relatedCases = _.each(_.cloneDeep(item['api.Case.get.1'].values), formatCase);
      // Add linked cases
      _.each(_.cloneDeep(item['api.Case.get.2'].values), function (linkedCase) {
        var existing = _.find(item.relatedCases, {id: linkedCase.id});
        if (existing) {
          existing.is_linked = true;
        } else {
          linkedCase.is_linked = true;
          item.relatedCases.push(formatCase(linkedCase));
        }
      });
      delete (item['api.Case.get.1']);
      delete (item['api.Case.get.2']);
      // Recent communications
      item.recentCommunication = _.each(_.cloneDeep(item['api.Activity.get.2'].values), formatAct);
      delete (item['api.Activity.get.2']);
      // Tasks
      item.tasks = _.each(_.cloneDeep(item['api.Activity.get.3'].values), formatAct);
      delete (item['api.Activity.get.3']);
      // Custom fields
      item.customData = item['api.CustomValue.gettree'].values || [];
      delete (item['api.CustomValue.gettree']);
      return item;
    }

    function getAllowedCaseStatuses (definition) {
      var ret = _.cloneDeep(caseStatuses);
      if (definition.statuses && definition.statuses.length) {
        _.each(_.cloneDeep(ret), function (status, id) {
          if (definition.statuses.indexOf(status.name) < 0) {
            delete (ret[id]);
          }
        });
      }
      return ret;
    }

    function getAvailableActivityTypes (activityCount, definition) {
      var ret = [];
      var exclude = ['Change Case Status', 'Change Case Type'];

      _.each(definition.activityTypes, function (actSpec) {
        if (exclude.indexOf(actSpec.name) < 0) {
          var actTypeId = _.findKey(activityTypes, {name: actSpec.name});
          if (!actSpec.max_instances || !activityCount[actTypeId] || (actSpec.max_instances < activityCount[actTypeId])) {
            ret.push($.extend({id: actTypeId}, activityTypes[actTypeId]));
          }
        }
      });
      return _.sortBy(ret, 'label');
    }

    function itemWatcher () {
      // Fetch extra info about the case
      if ($scope.item && $scope.item.id && !$scope.item.definition) {
        crmApi('Case', 'getdetails', caseGetParams()).then(function (info) {
          $scope.pushCaseData(info.values[0]);
        });

        $scope.item.nextActivityNotMilestone = findNextActivityWhichIsNotMilestone($scope.item.allActivities);
      }
    }

    /**
     * Find Recent Open activity which is not milestone
     *
     * @params {Array} - Array of activities
     * @return {object} - next activity
     */
    function findNextActivityWhichIsNotMilestone (activities) {
      var nextActivity;
      var hit = false;

      _.each(activities, function (act, key) {
        if (CRM.civicase.activityTypes[act.activity_type_id].grouping !== 'milestone' && !hit) {
          nextActivity = act;
          nextActivity.type = CRM.civicase.activityTypes[act.activity_type_id].label;
          nextActivity.category = [CRM.civicase.activityTypes[act.activity_type_id].grouping];
          nextActivity.icon = CRM.civicase.activityTypes[act.activity_type_id].icon;
          hit = true;
        }
      });

      return nextActivity;
    }

    function isFocusedWatcher () {
      $timeout(function () {
        var $actHeader = $('.act-feed-panel .panel-header');
        var $actControls = $('.act-feed-panel .act-list-controls');

        if ($actHeader.hasClass('affix')) {
          $actHeader.css('width', $('.act-feed-panel').css('width'));
        } else {
          $actHeader.css('width', 'auto');
        }

        if ($actControls.hasClass('affix')) {
          $actControls.css('width', $actHeader.css('width'));
        } else {
          $actControls.css('width', 'auto');
        }
      }, 1500);
    }
  }

  module.directive('civicaseCaseTabAffix', function ($timeout) {
    return {
      scope: {},
      link: civicaseCaseTabAffix
    };

    /**
     * Link function for civicaseCaseTabAffix
     *
     * @param {Object} scope
     * @param {Object} $el
     * @param {Object} attrs
     */
    function civicaseCaseTabAffix (scope, $el, attrs) {
      $timeout(function () {
        var $caseNavigation = $('.civicase__case-body_tab');
        var $toolbarDrawer = $('#toolbar');
        var $casePanelBody = $('.civicase__case-details-panel > .panel-body');

        $caseNavigation.affix({
          offset: {
            top: $casePanelBody.offset().top - 87
          }
        }).on('affixed.bs.affix', function () {
          $caseNavigation.css('top', $toolbarDrawer.height());
        }).on('affixed-top.bs.affix', function () {
          $caseNavigation.css('top', 'auto');
        });
      });
    }
  });
})(angular, CRM.$, CRM._);
