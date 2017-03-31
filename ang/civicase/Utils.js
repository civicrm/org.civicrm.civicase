(function(angular, $, _) {

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

  angular.module('civicase').factory('isActivityOverdue', function(crmLegacy) {
    return function(act) {
      var statuses = crmLegacy.civicase.activityStatuses,
        now = new Date();
      return !!act &&
        (['Completed', 'Canceled'].indexOf(statuses[act.status_id].name) < 0) &&
        (crmLegacy.utils.makeDate(act.activity_date_time) < now);
    };
  });

  angular.module('civicase').factory('formatActivity', function(crmLegacy) {
    var activityTypes = CRM.civicase.activityTypes;
    var activityStatuses = CRM.civicase.activityStatuses;
    return function (act) {
      act.category = (activityTypes[act.activity_type_id].grouping ? activityTypes[act.activity_type_id].grouping.split(',') : []);
      act.icon = activityTypes[act.activity_type_id].icon;
      act.type = activityTypes[act.activity_type_id].label;
      act.status = activityStatuses[act.status_id].label;
      act.is_completed = activityStatuses[act.status_id].name === 'Completed';
      act.color = activityStatuses[act.status_id].color || '#42afcb';
      if (act.category.indexOf('alert') > -1) {
        act.color = ''; // controlled by css
      }
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

})(angular, CRM.$, CRM._);
