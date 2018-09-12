(function () {
  var module = angular.module('civicase.data');
  CRM.civicase.caseStatuses = {
    '1': {
      'label': 'Ongoing',
      'color': '#42afcb',
      'name': 'Open',
      'grouping': 'Opened'
    },
    '2': {
      'label': 'Resolved',
      'color': '#4d5663',
      'name': 'Closed',
      'grouping': 'Closed'
    },
    '3': {
      'label': 'Urgent',
      'color': '#e6807f',
      'name': 'Urgent',
      'grouping': 'Opened'
    }
  };

  module.constant('CaseStatuses', {
    values: CRM.civicase.caseStatuses
  });
}());
