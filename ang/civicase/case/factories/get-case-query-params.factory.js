(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

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
        'api.Case.getcaselist.relatedCasesByContact': {
          contact_id: {IN: '$value.contact_id'},
          id: {'!=': '$value.id'},
          is_deleted: 0,
          return: caseListReturnParams,
          'api.Activity.get.1': allActivitiesParams
        },
        // Linked cases
        'api.Case.getcaselist.linkedCases': {
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
})(angular, CRM.$, CRM._, CRM);
