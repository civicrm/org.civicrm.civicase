(function () {
  var module = angular.module('civicase.data');
  CRM.civicase.caseActions = [
    {
      'id': '1',
      'case_type_id': '1',
      'subject': 'This case is in reference to Shauna Wattson.',
      'start_date': '2017-11-21',
      'status_id': '1',
      'is_deleted': '0',
      'created_date': '2018-08-05 13:18:01',
      'modified_date': '2018-08-05 13:18:01',
      'contact_id': {
        '1': '2'
      },
      'client_id': {
        '1': '2'
      }
    },
    {
      'id': '2',
      'case_type_id': '2',
      'subject': 'This case is in reference to Kiara Jones.',
      'start_date': '2018-06-22',
      'status_id': '1',
      'is_deleted': '0',
      'created_date': '2018-08-05 13:18:01',
      'modified_date': '2018-08-05 13:18:01',
      'contact_id': {
        '1': '3'
      },
      'client_id': {
        '1': '3'
      }
    },
    {
      'id': '3',
      'case_type_id': '1',
      'subject': 'This case is in reference to Shauna Barkley and Mrs. Betty Adams and Russell Wattson.',
      'start_date': '2018-06-01',
      'status_id': '1',
      'is_deleted': '0',
      'created_date': '2018-08-05 13:18:01',
      'modified_date': '2018-08-05 13:18:01',
      'contact_id': {
        '1': '4',
        '2': '110',
        '3': '123'
      },
      'client_id': {
        '1': '4',
        '2': '110',
        '3': '123'
      }
    },
    {
      'id': '4',
      'case_type_id': '2',
      'subject': 'This case is in reference to Valene Parker and cooper.omar@infomail.co.in.',
      'start_date': '2018-02-22',
      'status_id': '1',
      'is_deleted': '0',
      'created_date': '2018-08-05 13:18:01',
      'modified_date': '2018-08-05 13:18:01',
      'contact_id': {
        '1': '5',
        '2': '179'
      },
      'client_id': {
        '1': '5',
        '2': '179'
      }
    }
  ];

  module.constant('CaseActionsData', {
    values: CRM.civicase.caseActions
  });
}());
