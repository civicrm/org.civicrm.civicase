(function () {
  var module = angular.module('civicase.data');

  CRM.civicase.activityCategories = {
    'task': {
      'label': 'Task',
      'icon': 'fa-check-circle',
      'name': 'task'
    },
    'file': {
      'label': 'File',
      'icon': 'fa-file',
      'name': 'file'
    },
    'communication': {
      'label': 'Communication',
      'icon': 'fa-comment',
      'name': 'communication'
    },
    'milestone': {
      'label': 'Milestone',
      'icon': 'fa-flag',
      'name': 'milestone'
    },
    'alert': {
      'label': 'Alert',
      'icon': 'fa-exclamation-triangle',
      'name': 'alert'
    },
    'system': {
      'label': 'System',
      'icon': 'fa-info-circle',
      'name': 'system'
    }
  };

  module.constant('ActivityStatusTypesData', {
    values: CRM.civicase.activityCategories
  });
}());
