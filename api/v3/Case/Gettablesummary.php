<?php

/**
 * Specification of gettablesummary API call.
 *
 * @param array $spec
 */
function _civicrm_api3_case_gettablesummary_spec(&$spec) {
  $result = civicrm_api3('Case', 'getfields', array('api_action' => 'get'));
  $spec = $result['values'];

  $spec['case_manager'] = array(
    'title' => 'Case Manager',
    'description' => 'Contact id of the case manager',
    'type' => CRM_Utils_Type::T_INT,
  );

  $spec['contact_is_deleted'] = array(
    'title' => 'Contact Is Deleted',
    'description' => 'Set FALSE to filter out cases for deleted contacts, TRUE to return only cases of deleted contacts',
    'type' => CRM_Utils_Type::T_BOOLEAN,
  );
}

/**
 * Implementation of gettablesummary API call, which returns cases and the list
 * of columns tht should be used on case table view dashboard.
 *
 * @param $params
 *   API call parameters
 *
 * @return array
 *   List of headers to use on table view and list of cases.
 */
function civicrm_api3_case_gettablesummary($params) {
  $headers = _civicrm_api3_case_gettablesummary_get_headers();
  $resultDetails = _civicrm_api3_case_gettablesummary_get_cases($params);
  $cases = $resultDetails['values'];

  CRM_CiviCase_Utils_Hook::alterCaseTable($headers, $cases);

  $resultDetails['values'] = array(
    'headers' => $headers,
    'cases' => $cases,
  );

  return $resultDetails;
}

/**
 * Searches for cases' details, using given parameters.
 *
 * @param $params
 *   API call parameters
 *
 * @return array
 */
function _civicrm_api3_case_gettablesummary_get_cases($params) {
  $loggedContactID = CRM_Core_Session::singleton()->getLoggedInContactID();

  $requiredReturns = array(
    'subject', 'case_type_id', 'status_id', 'is_deleted', 'start_date',
    'modified_date', 'contacts', 'activity_summary', 'category_count',
    'tag_id.name', 'tag_id.color', 'tag_id.description',
  );
  $params['return'] = (isset($params['return']) ? array_merge($requiredReturns, $params['return']) : $requiredReturns);

  $caseDetails = civicrm_api3('Case', 'getdetails', $params);

  foreach ($caseDetails['values'] as &$case) {
    foreach ($case['contacts'] as $contact) {
      if ($contact['manager'] == 1) {
        $case['manager'] = $contact;
      }

      if ($loggedContactID == $contact['contact_id']) {
        $case['myRole'][] = $contact['role'];
      }
    }
  }

  return $caseDetails;
}

/**
 * Returns default headers to be used on case list table view.
 *
 * @return array
 *   List of headers
 */
function _civicrm_api3_case_gettablesummary_get_headers() {

  return array(
    array(
      'name' => 'next_activity',
      'label' => ts('Next Activity'),
    ),
    array(
      'name' => 'subject',
      'label' => ts('Subject'),
    ),
    array(
      'name' => 'status',
      'label' => ts('Status'),
    ),
    array(
      'name' => 'case_type',
      'label' => ts('Type'),
    ),
    array(
      'name' => 'manager',
      'label' => ts('Case Manager'),
    ),
    array(
      'name' => 'start_date',
      'label' => ts('Start Date'),
    ),
    array(
      'name' => 'modified_date',
      'label' => ts('Last Updated'),
    ),
    array(
      'name' => 'myRole',
      'label' => ts('My Role'),
    ),
  );

}
