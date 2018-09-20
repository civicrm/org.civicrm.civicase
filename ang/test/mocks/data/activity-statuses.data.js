(function (angular, CRM) {
  var module = angular.module('civicase.data');

  CRM.civicase.activityStatuses = {
    '1': {
      'label': 'Scheduled',
      'color': '#42afcb',
      'name': 'Scheduled',
      'grouping': 'none,task,file,communication,milestone,system'
    },
    '2': {
      'label': 'Completed',
      'color': '#8ec68a',
      'name': 'Completed',
      'grouping': 'none,task,file,communication,milestone,alert,system'
    },
    '3': {
      'label': 'Cancelled',
      'name': 'Cancelled',
      'grouping': 'none,communication,milestone,alert'
    },
    '4': {
      'label': 'Left Message',
      'color': '#eca67f',
      'name': 'Left Message',
      'grouping': 'none,communication,milestone'
    },
    '5': {
      'label': 'Unreachable',
      'name': 'Unreachable',
      'grouping': 'none,communication,milestone'
    },
    '6': {
      'label': 'Not Required',
      'name': 'Not Required',
      'grouping': 'none,task,milestone'
    },
    '7': {
      'label': 'Available',
      'color': '#5bc0de',
      'name': 'Available',
      'grouping': 'none,milestone'
    },
    '8': {
      'label': 'No-show',
      'name': 'No_show',
      'grouping': 'none,milestone'
    },
    '9': {
      'label': 'Unread',
      'color': '#d9534f',
      'name': 'Unread',
      'grouping': 'communication'
    },
    '10': {
      'label': 'Draft',
      'color': '#c2cfd8',
      'name': 'Draft',
      'grouping': 'communication'
    }
  };

  module.constant('ActivityStatusesData', {
    values: CRM.civicase.activityStatuses
  });
})(angular, CRM);
