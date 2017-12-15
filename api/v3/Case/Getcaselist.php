<?php
function _civicrm_api3_case_getcaselist_spec(&$spec) {
  $spec = civicrm_api3('Case', 'getfields', array('api_action' => 'get'))['values'];

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

function civicrm_api3_case_getcaselist($params) {
  return CRM_Civicase_Utils_Caselist::getCaseList($params);
}
