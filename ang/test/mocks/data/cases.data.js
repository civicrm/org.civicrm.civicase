(function () {
  var module = angular.module('civicase.data');

  CRM.civicase.activityStatusTypes = {
    'cancelled': [3, 5, 6, 8],
    'completed': [2],
    'incomplete': [1, 4, 7, 9, 10]
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
