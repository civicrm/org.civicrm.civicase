(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.factory('formatCase', function (formatActivity, ContactsCache) {
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
})(angular, CRM.$, CRM._, CRM);
