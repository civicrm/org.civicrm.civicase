(function () {
  var module = angular.module('civicase.data');

  CRM.civicase.activityTypes = {
    '1': {
      'label': 'Meeting',
      'icon': 'fa-slideshare',
      'name': 'Meeting',
      'grouping': 'communication'
    },
    '2': {
      'label': 'Phone Call',
      'icon': 'fa-phone',
      'name': 'Phone Call',
      'grouping': 'communication'
    },
    '3': {
      'label': 'Email',
      'icon': 'fa-envelope-o',
      'name': 'Email',
      'grouping': 'communication'
    },
    '4': {
      'label': 'Outbound SMS',
      'icon': 'fa-mobile',
      'name': 'SMS',
      'grouping': 'communication'
    },
    '5': {
      'label': 'Event Registration',
      'name': 'Event Registration'
    },
    '6': {
      'label': 'Contribution',
      'name': 'Contribution'
    },
    '7': {
      'label': 'Membership Signup',
      'name': 'Membership Signup'
    },
    '8': {
      'label': 'Membership Renewal',
      'name': 'Membership Renewal'
    },
    '9': {
      'label': 'Tell a Friend',
      'name': 'Tell a Friend'
    },
    '10': {
      'label': 'Pledge Acknowledgment',
      'name': 'Pledge Acknowledgment'
    },
    '11': {
      'label': 'Pledge Reminder',
      'name': 'Pledge Reminder'
    },
    '12': {
      'label': 'Inbound Email',
      'name': 'Inbound Email',
      'grouping': 'communication'
    },
    '13': {
      'label': 'Open Case',
      'icon': 'fa-folder-open-o',
      'name': 'Open Case',
      'grouping': 'milestone'
    },
    '14': {
      'label': 'Follow up',
      'icon': 'fa-share-square-o',
      'name': 'Follow up',
      'grouping': 'communication'
    },
    '15': {
      'label': 'Change Case Type',
      'icon': 'fa-random',
      'name': 'Change Case Type',
      'grouping': 'system'
    },
    '16': {
      'label': 'Change Case Status',
      'icon': 'fa-pencil-square-o',
      'name': 'Change Case Status',
      'grouping': 'system'
    },
    '17': {
      'label': 'Membership Renewal Reminder',
      'name': 'Membership Renewal Reminder'
    },
    '18': {
      'label': 'Change Case Start Date',
      'icon': 'fa-calendar',
      'name': 'Change Case Start Date',
      'grouping': 'system'
    },
    '19': {
      'label': 'Bulk Email',
      'name': 'Bulk Email'
    },
    '20': {
      'label': 'Assign Case Role',
      'icon': 'fa-user-plus',
      'name': 'Assign Case Role',
      'grouping': 'system'
    },
    '21': {
      'label': 'Remove Case Role',
      'icon': 'fa-user-times',
      'name': 'Remove Case Role',
      'grouping': 'system'
    },
    '22': {
      'label': 'Print/Merge Document',
      'icon': 'fa-file-pdf-o',
      'name': 'Print PDF Letter',
      'grouping': 'communication'
    },
    '23': {
      'label': 'Merge Case',
      'icon': 'fa-compress',
      'name': 'Merge Case',
      'grouping': 'system'
    },
    '24': {
      'label': 'Reassigned Case',
      'icon': 'fa-user-circle-o',
      'name': 'Reassigned Case',
      'grouping': 'system'
    },
    '25': {
      'label': 'Link Cases',
      'icon': 'fa-link',
      'name': 'Link Cases',
      'grouping': 'system'
    },
    '26': {
      'label': 'Change Case Tags',
      'icon': 'fa-tags',
      'name': 'Change Case Tags',
      'grouping': 'system'
    },
    '27': {
      'label': 'Add Client To Case',
      'icon': 'fa-users',
      'name': 'Add Client To Case',
      'grouping': 'system'
    },
    '28': {
      'label': 'Survey',
      'name': 'Survey'
    },
    '29': {
      'label': 'Canvass',
      'name': 'Canvass'
    },
    '30': {
      'label': 'PhoneBank',
      'name': 'PhoneBank'
    },
    '31': {
      'label': 'WalkList',
      'name': 'WalkList'
    },
    '32': {
      'label': 'Petition Signature',
      'name': 'Petition'
    },
    '33': {
      'label': 'Change Custom Data',
      'icon': 'fa-table',
      'name': 'Change Custom Data',
      'grouping': 'system'
    },
    '34': {
      'label': 'Mass SMS',
      'name': 'Mass SMS'
    },
    '35': {
      'label': 'Change Membership Status',
      'name': 'Change Membership Status'
    },
    '36': {
      'label': 'Change Membership Type',
      'name': 'Change Membership Type'
    },
    '37': {
      'label': 'Cancel Recurring Contribution',
      'name': 'Cancel Recurring Contribution'
    },
    '38': {
      'label': 'Update Recurring Contribution Billing Details',
      'name': 'Update Recurring Contribution Billing Details'
    },
    '39': {
      'label': 'Update Recurring Contribution',
      'name': 'Update Recurring Contribution'
    },
    '40': {
      'label': 'Reminder Sent',
      'name': 'Reminder Sent'
    },
    '41': {
      'label': 'Export Accounting Batch',
      'name': 'Export Accounting Batch'
    },
    '42': {
      'label': 'Create Batch',
      'name': 'Create Batch'
    },
    '43': {
      'label': 'Edit Batch',
      'name': 'Edit Batch'
    },
    '44': {
      'label': 'SMS delivery',
      'name': 'SMS delivery'
    },
    '45': {
      'label': 'Inbound SMS',
      'name': 'Inbound SMS'
    },
    '46': {
      'label': 'Payment',
      'name': 'Payment'
    },
    '47': {
      'label': 'Refund',
      'name': 'Refund'
    },
    '48': {
      'label': 'Change Registration',
      'name': 'Change Registration'
    },
    '49': {
      'label': 'Downloaded Invoice',
      'name': 'Downloaded Invoice'
    },
    '50': {
      'label': 'Emailed Invoice',
      'name': 'Emailed Invoice'
    },
    '51': {
      'label': 'Contact Merged',
      'name': 'Contact Merged'
    },
    '52': {
      'label': 'Contact Deleted by Merge',
      'name': 'Contact Deleted by Merge'
    },
    '53': {
      'label': 'Change Case Subject',
      'icon': 'fa-pencil-square-o',
      'name': 'Change Case Subject',
      'grouping': 'system'
    },
    '54': {
      'label': 'Failed Payment',
      'name': 'Failed Payment'
    },
    '55': {
      'label': 'Interview',
      'icon': 'fa-comment-o',
      'name': 'Interview'
    },
    '56': {
      'label': 'Medical evaluation',
      'name': 'Medical evaluation',
      'grouping': 'milestone'
    },
    '58': {
      'label': 'Mental health evaluation',
      'name': 'Mental health evaluation',
      'grouping': 'milestone'
    },
    '60': {
      'label': 'Secure temporary housing',
      'name': 'Secure temporary housing',
      'grouping': 'milestone'
    },
    '62': {
      'label': 'Income and benefits stabilization',
      'name': 'Income and benefits stabilization'
    },
    '64': {
      'label': 'Long-term housing plan',
      'name': 'Long-term housing plan',
      'grouping': 'milestone'
    },
    '66': {
      'label': 'ADC referral',
      'name': 'ADC referral'
    },
    '68': {
      'label': 'File Upload',
      'icon': 'fa-file',
      'name': 'File Upload'
    },
    '69': {
      'label': 'Remove Client From Case',
      'icon': 'fa-user-times',
      'name': 'Remove Client From Case',
      'grouping': 'system'
    },
    '70': {
      'label': 'Case Task',
      'name': 'Case Task',
      'grouping': 'task'
    },
    '72': {
      'label': 'Communication Act',
      'name': 'Communication Act',
      'grouping': 'communication'
    },
    '73': {
      'label': 'Alert',
      'icon': 'fa-exclamation',
      'name': 'Alert',
      'grouping': 'alert'
    }
  };

  module.constant('ActivityTypesData', {
    values: CRM.civicase.activityTypes
  });
}());
