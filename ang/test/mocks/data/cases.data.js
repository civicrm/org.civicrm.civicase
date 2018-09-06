(function () {
  var module = angular.module('civicase.data');

  CRM.civicase.activityStatusTypes = {
    'cancelled': [3, 5, 6, 8],
    'completed': [2],
    'incomplete': [1, 4, 7, 9, 10]
  };

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

  module.constant('CasesData', {
    values: [
      {
        'id': '141',
        'subject': 'This case is in reference to Ashlie Bachman-Wattson.',
        'case_type_id': '1',
        'status_id': '3',
        'is_deleted': false,
        'start_date': '2017-11-11',
        'modified_date': '2018-08-16 07:48:18',
        'contacts': [
          {
            'contact_id': '170',
            'sort_name': 'Adams, Kiara',
            'display_name': 'Kiara Adams',
            'email': 'adams.kiara@airmail.co.nz',
            'phone': '(781) 205-2601',
            'birth_date': '1980-10-09',
            'role': 'Client'
          },
          {
            'contact_id': '202',
            'display_name': 'admin@example.com',
            'sort_name': 'admin@example.com',
            'relationship_type_id': '11',
            'role': 'Homeless Services Coordinator',
            'email': 'admin@example.com',
            'phone': null,
            'creator': '1',
            'manager': '1'
          }
        ],
        'activity_summary': {
          'task': [
            {
              'id': '1777',
              'activity_type_id': '70',
              'activity_date_time': '2017-11-20 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '141',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '170'
              ],
              'target_contact_name': {
                '170': 'Kiara Adams'
              },
              'assignee_contact_id': [],
              'category': [
                'task'
              ],
              'type': 'Case Task',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'file': [],
          'communication': [
            {
              'id': '1773',
              'activity_type_id': '14',
              'activity_date_time': '2017-11-14 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '141',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '170'
              ],
              'target_contact_name': {
                '170': 'Kiara Adams'
              },
              'assignee_contact_id': [],
              'category': [
                'communication'
              ],
              'icon': 'fa-share-square-o',
              'type': 'Follow up',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'milestone': [
            {
              'id': '1770',
              'activity_type_id': '56',
              'activity_date_time': '2017-11-12 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '141',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '170'
              ],
              'target_contact_name': {
                '170': 'Kiara Adams'
              },
              'assignee_contact_id': [],
              'category': [
                'milestone'
              ],
              'type': 'Medical evaluation',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'alert': [],
          'system': [
            {
              'id': '1779',
              'activity_type_id': '25',
              'activity_date_time': '2018-08-16 07:47:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '141',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '170'
              ],
              'target_contact_name': {
                '170': 'Kiara Adams'
              },
              'assignee_contact_id': [],
              'category': [
                'system'
              ],
              'icon': 'fa-link',
              'type': 'Link Cases',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'next': [
            {
              'id': '1770',
              'activity_type_id': '56',
              'activity_date_time': '2017-11-12 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '141',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '170'
              ],
              'target_contact_name': {
                '170': 'Kiara Adams'
              },
              'assignee_contact_id': [],
              'category': [
                'milestone'
              ],
              'type': 'Medical evaluation',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ]
        },
        'category_count': {
          'incomplete': {
            'task': 2,
            'communication': 2,
            'milestone': 4,
            'system': 1
          },
          'completed': {
            'system': 2
          }
        },
        'api.Activity.get': {
          'is_error': 0,
          'version': 3,
          'count': 18,
          'values': [
            {
              'id': '1770',
              'activity_type_id': '56',
              'activity_date_time': '2017-11-12 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1771',
              'activity_type_id': '58',
              'activity_date_time': '2017-11-12 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1772',
              'activity_type_id': '60',
              'activity_date_time': '2017-11-13 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1773',
              'activity_type_id': '14',
              'activity_date_time': '2017-11-14 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1774',
              'activity_type_id': '62',
              'activity_date_time': '2017-11-18 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1775',
              'activity_type_id': '64',
              'activity_date_time': '2017-11-25 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1776',
              'activity_type_id': '14',
              'activity_date_time': '2017-12-02 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1777',
              'activity_type_id': '70',
              'activity_date_time': '2017-11-20 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1778',
              'activity_type_id': '70',
              'activity_date_time': '2017-11-21 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '1',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-06 14:14:58',
              'source_contact_id': '202'
            },
            {
              'id': '1779',
              'activity_type_id': '25',
              'activity_date_time': '2018-08-16 07:47:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'medium_id': '2',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:42',
              'modified_date': '2018-08-16 07:47:23',
              'source_contact_id': '202'
            },
            {
              'id': '1780',
              'activity_type_id': '23',
              'subject': 'Case 81 copied from contact id 122 to contact id 170 via merge. New Case ID is 141.',
              'activity_date_time': '2018-08-16 07:47:43',
              'status_id': '2',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:47:43',
              'modified_date': '2018-08-16 07:47:43',
              'source_contact_id': '202'
            },
            {
              'id': '1782',
              'activity_type_id': '16',
              'subject': 'Case status changed from Ongoing to Urgent',
              'activity_date_time': '2018-08-16 07:48:18',
              'status_id': '2',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-08-16 07:48:18',
              'modified_date': '2018-08-16 07:48:18',
              'source_contact_id': '202'
            },
            {
              'id': '1791',
              'activity_type_id': '56',
              'subject': 'Overdue task',
              'activity_date_time': '2018-09-04 12:50:00',
              'duration': '20',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'medium_id': '2',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-09-06 12:51:46',
              'modified_date': '2018-09-06 12:51:46',
              'source_contact_id': '202'
            },
            {
              'id': '1792',
              'source_record_id': '1791',
              'activity_type_id': '3',
              'subject': 'Overdue task - copy sent to admin@example.com',
              'activity_date_time': '2018-09-06 12:51:46',
              'details': '===========================================================\nActivity Summary - Medical evaluation\n===========================================================\nYour Case Role(s) : Homeless Services Coordinator\nManage Case : http://civicase.local/civicrm/contact/view/case?reset=1&amp;id=141&amp;cid=170&amp;action=view&amp;context=home\n\nEdit activity : http://civicase.local/civicrm/case/activity?reset=1&amp;cid=170&amp;caseid=141&amp;action=update&amp;id=1791\nView activity : http://civicase.local/civicrm/case/activity/view?reset=1&amp;aid=1791&amp;cid=170&amp;caseID=141\n\nClient : Kiara Adams\nActivity Type : Medical evaluation\nSubject : Overdue task\nCreated By : admin@example.com\nReported By : admin@example.com\nMedium : Phone\nLocation : \nDate and Time : September 4th, 2018 12:50 PM\nDetails : \nDuration : 20 minutes\nStatus : Scheduled\nPriority : \nCase ID : 141\n\n',
              'status_id': '2',
              'priority_id': '2',
              'is_test': '0',
              'medium_id': '0',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-09-06 12:51:47',
              'modified_date': '2018-09-06 12:51:47',
              'source_contact_id': '202'
            },
            {
              'id': '1793',
              'activity_type_id': '70',
              'subject': 'Some overdue task',
              'activity_date_time': '2018-09-03 12:53:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'medium_id': '2',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-09-06 12:54:46',
              'modified_date': '2018-09-06 12:54:46',
              'source_contact_id': '202'
            },
            {
              'id': '1794',
              'activity_type_id': '3',
              'subject': 'TO be happneing in future',
              'activity_date_time': '2018-09-06 14:29:13',
              'details': '<p>Some conv</p>\n',
              'status_id': '2',
              'priority_id': '2',
              'is_test': '0',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-09-06 14:29:13',
              'modified_date': '2018-09-06 14:29:13',
              'source_contact_id': '202'
            },
            {
              'id': '1797',
              'activity_type_id': '70',
              'subject': 'TO be happening in future',
              'activity_date_time': '2025-09-18 14:29:00',
              'status_id': '1',
              'priority_id': '2',
              'is_test': '0',
              'medium_id': '2',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-09-06 14:31:12',
              'modified_date': '2018-09-06 14:31:12',
              'source_contact_id': '202'
            },
            {
              'id': '1798',
              'activity_type_id': '70',
              'subject': 'Some subject',
              'activity_date_time': '2018-09-29 00:00:00',
              'status_id': '1',
              'priority_id': '2',
              'parent_id': '1797',
              'is_test': '0',
              'is_auto': '0',
              'is_current_revision': '1',
              'is_deleted': '0',
              'is_star': '0',
              'created_date': '2018-09-06 14:31:12',
              'modified_date': '2018-09-06 14:31:12',
              'source_contact_id': '202'
            }
          ]
        },
        'manager': {
          'contact_id': '202',
          'display_name': 'admin@example.com',
          'sort_name': 'admin@example.com',
          'relationship_type_id': '11',
          'role': 'Homeless Services Coordinator',
          'email': 'admin@example.com',
          'phone': null,
          'creator': '1',
          'manager': '1'
        },
        'myRole': [],
        'next_activity': {
          'id': '1770',
          'activity_type_id': '56',
          'activity_date_time': '2017-11-12 00:00:00',
          'status_id': '1',
          'is_star': '0',
          'case_id': '141',
          'is_overdue': true,
          'source_contact_id': '202',
          'target_contact_id': [
            '170'
          ],
          'target_contact_name': {
            '170': 'Kiara Adams'
          },
          'assignee_contact_id': [],
          'category': [
            'milestone'
          ],
          'type': 'Medical evaluation',
          'status': 'Scheduled',
          'status_name': 'Scheduled',
          'status_type': 'incomplete',
          'is_completed': false,
          'color': '#42afcb',
          'status_css': 'status-type-incomplete activity-status-scheduled'
        },
        'client': [
          {
            'contact_id': '170',
            'sort_name': 'Adams, Kiara',
            'display_name': 'Kiara Adams',
            'email': 'adams.kiara@airmail.co.nz',
            'phone': '(781) 205-2601',
            'birth_date': '1980-10-09',
            'role': 'Client'
          }
        ],
        'status': 'Urgent',
        'color': '#e6807f',
        'case_type': 'Housing Support',
        'selected': false
      },
      {
        'id': '3',
        'subject': 'This case is in reference to Shauna Barkley.',
        'case_type_id': '1',
        'status_id': '1',
        'is_deleted': false,
        'start_date': '2018-05-11',
        'modified_date': '2018-08-06 14:14:54',
        'contacts': [
          {
            'contact_id': '4',
            'sort_name': 'Barkley, Shauna',
            'display_name': 'Shauna Barkley',
            'email': 'barkley.shauna@notmail.org',
            'phone': null,
            'birth_date': '2004-05-15',
            'role': 'Client'
          },
          {
            'contact_id': '202',
            'display_name': 'admin@example.com',
            'sort_name': 'admin@example.com',
            'relationship_type_id': '11',
            'role': 'Homeless Services Coordinator',
            'email': 'admin@example.com',
            'phone': null,
            'creator': '1',
            'manager': '1'
          }
        ],
        'tag_id': {
          '10': {
            'tag_id': '10',
            'tag_id.name': 'Orange',
            'tag_id.color': '#ff9d2a',
            'tag_id.description': "Orange you glad this isn't a pun?"
          }
        },
        'activity_summary': {
          'task': [
            {
              'id': '649',
              'activity_type_id': '70',
              'activity_date_time': '2018-05-20 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '3',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '4'
              ],
              'target_contact_name': {
                '4': 'Shauna Barkley'
              },
              'assignee_contact_id': [],
              'category': [
                'task'
              ],
              'type': 'Case Task',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'file': [],
          'communication': [
            {
              'id': '645',
              'activity_type_id': '14',
              'activity_date_time': '2018-05-14 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '3',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '4'
              ],
              'target_contact_name': {
                '4': 'Shauna Barkley'
              },
              'assignee_contact_id': [],
              'category': [
                'communication'
              ],
              'icon': 'fa-share-square-o',
              'type': 'Follow up',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'milestone': [
            {
              'id': '642',
              'activity_type_id': '56',
              'activity_date_time': '2018-05-12 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '3',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '4'
              ],
              'target_contact_name': {
                '4': 'Shauna Barkley'
              },
              'assignee_contact_id': [],
              'category': [
                'milestone'
              ],
              'type': 'Medical evaluation',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'alert': [],
          'system': [],
          'next': [
            {
              'id': '642',
              'activity_type_id': '56',
              'activity_date_time': '2018-05-12 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '3',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '4'
              ],
              'target_contact_name': {
                '4': 'Shauna Barkley'
              },
              'assignee_contact_id': [],
              'category': [
                'milestone'
              ],
              'type': 'Medical evaluation',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ]
        },
        'category_count': {
          'incomplete': {
            'task': 2,
            'communication': 2,
            'milestone': 4
          },
          'completed': {
            'milestone': 1
          }
        },
        'manager': {
          'contact_id': '202',
          'display_name': 'admin@example.com',
          'sort_name': 'admin@example.com',
          'relationship_type_id': '11',
          'role': 'Homeless Services Coordinator',
          'email': 'admin@example.com',
          'phone': null,
          'creator': '1',
          'manager': '1'
        },
        'myRole': [],
        'next_activity': {
          'id': '642',
          'activity_type_id': '56',
          'activity_date_time': '2018-05-12 00:00:00',
          'status_id': '1',
          'is_star': '0',
          'case_id': '3',
          'is_overdue': true,
          'source_contact_id': '202',
          'target_contact_id': [
            '4'
          ],
          'target_contact_name': {
            '4': 'Shauna Barkley'
          },
          'assignee_contact_id': [],
          'category': [
            'milestone'
          ],
          'type': 'Medical evaluation',
          'status': 'Scheduled',
          'status_name': 'Scheduled',
          'status_type': 'incomplete',
          'is_completed': false,
          'color': '#42afcb',
          'status_css': 'status-type-incomplete activity-status-scheduled'
        },
        'client': [
          {
            'contact_id': '4',
            'sort_name': 'Barkley, Shauna',
            'display_name': 'Shauna Barkley',
            'email': 'barkley.shauna@notmail.org',
            'phone': null,
            'birth_date': '2004-05-15',
            'role': 'Client'
          }
        ],
        'status': 'Ongoing',
        'color': '#42afcb',
        'case_type': 'Housing Support',
        'selected': false
      },
      {
        'id': '119',
        'subject': 'This case is in reference to Lou Blackwell Sr. and Mr. Maxwell Zope Sr. and Mrs. Tanya Jameson.',
        'case_type_id': '2',
        'status_id': '1',
        'is_deleted': false,
        'start_date': '2018-06-12',
        'modified_date': '2018-08-06 14:15:01',
        'contacts': [
          {
            'contact_id': '167',
            'sort_name': 'Blackwell, Lou',
            'display_name': 'Lou Blackwell Sr.',
            'email': null,
            'phone': null,
            'birth_date': '2005-01-10',
            'role': 'Client'
          },
          {
            'contact_id': '128',
            'sort_name': 'Zope, Maxwell',
            'display_name': 'Mr. Maxwell Zope Sr.',
            'email': 'zope.maxwell40@spamalot.co.in',
            'phone': null,
            'birth_date': '1985-04-08',
            'role': 'Client'
          },
          {
            'contact_id': '129',
            'sort_name': 'Jameson, Tanya',
            'display_name': 'Mrs. Tanya Jameson',
            'email': null,
            'phone': '656-8538',
            'birth_date': '1955-03-12',
            'role': 'Client'
          },
          {
            'contact_id': '202',
            'display_name': 'admin@example.com',
            'sort_name': 'admin@example.com',
            'relationship_type_id': '13',
            'role': 'Senior Services Coordinator',
            'email': 'admin@example.com',
            'phone': null,
            'creator': '1',
            'manager': '1'
          }
        ],
        'tag_id': {
          '9': {
            'tag_id': '9',
            'tag_id.name': 'Grape',
            'tag_id.color': '#9044b8',
            'tag_id.description': 'I heard it through the grapevine'
          }
        },
        'activity_summary': {
          'task': [],
          'file': [],
          'communication': [
            {
              'id': '1575',
              'activity_type_id': '14',
              'activity_date_time': '2018-06-26 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '119',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '167',
                '128',
                '129'
              ],
              'target_contact_name': {
                '128': 'Mr. Maxwell Zope Sr.',
                '129': 'Mrs. Tanya Jameson',
                '167': 'Lou Blackwell Sr.'
              },
              'assignee_contact_id': [],
              'category': [
                'communication'
              ],
              'icon': 'fa-share-square-o',
              'type': 'Follow up',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'milestone': [
            {
              'id': '1572',
              'activity_type_id': '56',
              'activity_date_time': '2018-06-15 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '119',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '167',
                '128',
                '129'
              ],
              'target_contact_name': {
                '128': 'Mr. Maxwell Zope Sr.',
                '129': 'Mrs. Tanya Jameson',
                '167': 'Lou Blackwell Sr.'
              },
              'assignee_contact_id': [],
              'category': [
                'milestone'
              ],
              'type': 'Medical evaluation',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ],
          'alert': [],
          'system': [],
          'next': [
            {
              'id': '1572',
              'activity_type_id': '56',
              'activity_date_time': '2018-06-15 00:00:00',
              'status_id': '1',
              'is_star': '0',
              'case_id': '119',
              'is_overdue': true,
              'source_contact_id': '202',
              'target_contact_id': [
                '167',
                '128',
                '129'
              ],
              'target_contact_name': {
                '128': 'Mr. Maxwell Zope Sr.',
                '129': 'Mrs. Tanya Jameson',
                '167': 'Lou Blackwell Sr.'
              },
              'assignee_contact_id': [],
              'category': [
                'milestone'
              ],
              'type': 'Medical evaluation',
              'status': 'Scheduled',
              'status_name': 'Scheduled',
              'status_type': 'incomplete',
              'is_completed': false,
              'color': '#42afcb',
              'status_css': 'status-type-incomplete activity-status-scheduled'
            }
          ]
        },
        'category_count': {
          'incomplete': {
            'communication': 1,
            'milestone': 2
          },
          'completed': {
            'milestone': 1
          }
        },
        'manager': {
          'contact_id': '202',
          'display_name': 'admin@example.com',
          'sort_name': 'admin@example.com',
          'relationship_type_id': '13',
          'role': 'Senior Services Coordinator',
          'email': 'admin@example.com',
          'phone': null,
          'creator': '1',
          'manager': '1'
        },
        'myRole': [],
        'next_activity': {
          'id': '1572',
          'activity_type_id': '56',
          'activity_date_time': '2018-06-15 00:00:00',
          'status_id': '1',
          'is_star': '0',
          'case_id': '119',
          'is_overdue': true,
          'source_contact_id': '202',
          'target_contact_id': [
            '167',
            '128',
            '129'
          ],
          'target_contact_name': {
            '128': 'Mr. Maxwell Zope Sr.',
            '129': 'Mrs. Tanya Jameson',
            '167': 'Lou Blackwell Sr.'
          },
          'assignee_contact_id': [],
          'category': [
            'milestone'
          ],
          'type': 'Medical evaluation',
          'status': 'Scheduled',
          'status_name': 'Scheduled',
          'status_type': 'incomplete',
          'is_completed': false,
          'color': '#42afcb',
          'status_css': 'status-type-incomplete activity-status-scheduled'
        },
        'client': [
          {
            'contact_id': '167',
            'sort_name': 'Blackwell, Lou',
            'display_name': 'Lou Blackwell Sr.',
            'email': null,
            'phone': null,
            'birth_date': '2005-01-10',
            'role': 'Client'
          },
          {
            'contact_id': '128',
            'sort_name': 'Zope, Maxwell',
            'display_name': 'Mr. Maxwell Zope Sr.',
            'email': 'zope.maxwell40@spamalot.co.in',
            'phone': null,
            'birth_date': '1985-04-08',
            'role': 'Client'
          },
          {
            'contact_id': '129',
            'sort_name': 'Jameson, Tanya',
            'display_name': 'Mrs. Tanya Jameson',
            'email': null,
            'phone': '656-8538',
            'birth_date': '1955-03-12',
            'role': 'Client'
          }
        ],
        'status': 'Ongoing',
        'color': '#42afcb',
        'case_type': 'Adult Day Care Referral',
        'selected': false
      }
    ]
  });
}());
