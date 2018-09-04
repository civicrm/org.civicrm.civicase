(function () {
  var module = angular.module('civicase.data');
  CRM.civicase.activityTypes = {
    '1': { 'label': 'Meeting', 'icon': 'fa-slideshare', 'name': 'Meeting', 'grouping': 'communication' },
    '2': { 'label': 'Phone Call', 'icon': 'fa-phone', 'name': 'Phone Call', 'grouping': 'communication' },
    '3': { 'label': 'Email', 'icon': 'fa-envelope-o', 'name': 'Email', 'grouping': 'communication' },
    '4': { 'label': 'Outbound SMS', 'icon': 'fa-mobile', 'name': 'SMS', 'grouping': 'communication' },
    '5': { 'label': 'Event Registration', 'name': 'Event Registration' },
    '6': { 'label': 'Contribution', 'name': 'Contribution' },
    '7': { 'label': 'Membership Signup', 'name': 'Membership Signup' },
    '8': { 'label': 'Membership Renewal', 'name': 'Membership Renewal' },
    '9': { 'label': 'Tell a Friend', 'name': 'Tell a Friend' },
    '10': { 'label': 'Pledge Acknowledgment', 'name': 'Pledge Acknowledgment' },
    '11': { 'label': 'Pledge Reminder', 'name': 'Pledge Reminder' },
    '12': { 'label': 'Inbound Email', 'name': 'Inbound Email', 'grouping': 'communication' },
    '13': { 'label': 'Open Case', 'icon': 'fa-folder-open-o', 'name': 'Open Case', 'grouping': 'milestone' },
    '14': { 'label': 'Follow up', 'icon': 'fa-share-square-o', 'name': 'Follow up', 'grouping': 'communication' },
    '15': { 'label': 'Change Case Type', 'icon': 'fa-random', 'name': 'Change Case Type', 'grouping': 'system' },
    '16': { 'label': 'Change Case Status', 'icon': 'fa-pencil-square-o', 'name': 'Change Case Status', 'grouping': 'system' },
    '17': { 'label': 'Membership Renewal Reminder', 'name': 'Membership Renewal Reminder' },
    '18': { 'label': 'Change Case Start Date', 'icon': 'fa-calendar', 'name': 'Change Case Start Date', 'grouping': 'system' },
    '19': { 'label': 'Bulk Email', 'name': 'Bulk Email' },
    '20': { 'label': 'Assign Case Role', 'icon': 'fa-user-plus', 'name': 'Assign Case Role', 'grouping': 'system' },
    '21': { 'label': 'Remove Case Role', 'icon': 'fa-user-times', 'name': 'Remove Case Role', 'grouping': 'system' }
  };

  module.constant('ActivityTypesData', {
    values: CRM.civicase.activityTypes
  });
}());
