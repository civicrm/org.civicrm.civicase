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

  function civicaseCaseDetailsController ($scope, crmApi, formatActivity, formatCase, getActivityFeedUrl, getCaseQueryParams, $route, $timeout) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase');
    var caseTypes = CRM.civicase.caseTypes;
    var caseStatuses = $scope.caseStatuses = CRM.civicase.caseStatuses;
    var activityTypes = $scope.activityTypes = CRM.civicase.activityTypes;
    var panelLimit = 5;

    $scope.areDetailsLoaded = false;
    $scope.relatedCasesPager = { total: 0, size: 5, num: 0, range: {} };
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

    /**
     * Decide if the sent related case is visible with respect to the pager
     *
     * @param {int} index
     * @return {boolean}
     */
    $scope.isCurrentRelatedCaseVisible = function (index) {
      $scope.relatedCasesPager.range.from = (($scope.relatedCasesPager.num - 1) * $scope.relatedCasesPager.size) + 1;
      $scope.relatedCasesPager.range.to = ($scope.relatedCasesPager.num * $scope.relatedCasesPager.size);

      if ($scope.relatedCasesPager.range.to > $scope.item.relatedCases.length) {
        $scope.relatedCasesPager.range.to = $scope.item.relatedCases.length;
      }

      return index >= ($scope.relatedCasesPager.range.from - 1) && index < $scope.relatedCasesPager.range.to;
    };

    // Copied from ActivityFeed.js - used by the Recent Communication panel
    $scope.isSameDate = function (d1, d2) {
      return d1 && d2 && (d1.slice(0, 10) === d2.slice(0, 10));
    };

    $scope.markCompleted = function (act) {
      $scope.refresh([['Activity', 'create', {id: act.id, status_id: act.is_completed ? 'Scheduled' : 'Completed'}]]);
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
        $scope.$broadcast('updateCaseData');
      }
    };

    $scope.refresh = function (apiCalls) {
      $scope.areDetailsLoaded = false;

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
      return getCaseQueryParams($scope.item.id, panelLimit);
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

    /**
     * Formats the case detail object in required format
     *
     * @params {Object} - object params
     * @return {Object}
     */
    function formatCaseDetails (item) {
      formatCase(item);
      item.definition = caseTypes[item.case_type_id].definition;
      item.relatedCases = _.each(_.cloneDeep(item['api.Case.getcaselist.1'].values), formatCase);
      // Add linked cases
      _.each(_.cloneDeep(item['api.Case.getcaselist.2'].values), function (linkedCase) {
        var existing = _.find(item.relatedCases, {id: linkedCase.id});
        if (existing) {
          existing.is_linked = true;
        } else {
          linkedCase.is_linked = true;
          item.relatedCases.push(formatCase(linkedCase));
        }
      });
      $scope.relatedCasesPager.num = 1;

      delete (item['api.Case.getcaselist.1']);
      delete (item['api.Case.getcaselist.2']);
      // Recent communications
      item.recentCommunication = _.each(_.cloneDeep(item['api.Activity.get.2'].values), formatAct);
      delete (item['api.Activity.get.2']);
      // Tasks
      item.tasks = _.each(_.cloneDeep(item['api.Activity.get.3'].values), formatAct);
      delete (item['api.Activity.get.3']);
      // Custom fields
      item.customData = item['api.CustomValue.gettree'].values || [];
      delete (item['api.CustomValue.gettree']);
      // Set  next Acitivity which is not milestone
      item.nextActivityNotMilestone = findNextIncompleteActivityWhichIsNotMilestone(item.allActivities);
      $scope.areDetailsLoaded = true;

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

    function itemWatcher () {
      // Fetch extra info about the case
      if ($scope.item && $scope.item.id && !$scope.item.definition) {
        $scope.areDetailsLoaded = false;

        crmApi('Case', 'getdetails', caseGetParams()).then(function (info) {
          $scope.pushCaseData(info.values[0]);
        });
      }
    }

    /**
     * Find Recent Open activity which is not milestone
     *
     * @params {Array} - Array of activities
     * @return {object} - next activity
     */
    function findNextIncompleteActivityWhichIsNotMilestone (activities) {
      var nextActivity = _.find(activities, function (activity) {
        var notMilestone = CRM.civicase.activityTypes[activity.activity_type_id].grouping !== 'milestone';
        var notComplete = CRM.civicase.activityStatusTypes.completed.indexOf(parseInt(activity.status_id, 10)) === -1;

        return notMilestone && notComplete;
      });

      if (!nextActivity) {
        return;
      }

      nextActivity.type = CRM.civicase.activityTypes[nextActivity.activity_type_id].label;
      nextActivity.category = [CRM.civicase.activityTypes[nextActivity.activity_type_id].grouping];
      nextActivity.icon = CRM.civicase.activityTypes[nextActivity.activity_type_id].icon;

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
        var bodyPadding = parseInt($('body').css('padding-top'), 10); // to see the space for fixed menus

        $caseNavigation.affix({
          offset: {
            top: $casePanelBody.offset().top - bodyPadding
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
