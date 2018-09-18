(function () {
  var module = angular.module('civicase.data');
  CRM.civicase.caseTypes = {
    '1': {
      'name': 'housing_support',
      'title': 'Housing Support',
      'description': 'Help homeless individuals obtain temporary and long-term housing',
      'definition': {
        'activityTypes': [
          { 'name': 'Open Case', 'max_instances': '1' },
          { 'name': 'Medical evaluation' },
          { 'name': 'Mental health evaluation' }
        ],
        'activitySets': [
          {
            'name': 'standard_timeline',
            'label': 'Standard Timeline',
            'timeline': '1',
            'activityTypes': [
              { 'name': 'Open Case', 'status': 'Completed' },
              { 'name': 'Medical evaluation', 'reference_activity': 'Open Case', 'reference_offset': '1', 'reference_select': 'newest' }
            ]
          }
        ],
        'timelineActivityTypes': [
          { 'name': 'Open Case', 'status': 'Completed' },
          { 'name': 'Medical evaluation', 'reference_activity': 'Open Case', 'reference_offset': '1', 'reference_select': 'newest' }
        ],
        'caseRoles': [
          { 'name': 'Homeless Services Coordinator', 'creator': '1', 'manager': '1' },
          { 'name': 'Health Services Coordinator' }
        ]
      }
    }
  };

  module.constant('CaseTypesData', {
    values: CRM.civicase.caseTypes
  });
}());
