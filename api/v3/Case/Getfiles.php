<?php

/**
 * Case.Getfiles API specification (optional)
 * This is used for documentation and validation.
 *
 * @param array $spec description of fields supported by this API call
 * @return void
 * @see http://wiki.civicrm.org/confluence/display/CRMDOC/API+Architecture+Standards
 */
function _civicrm_api3_case_getfiles_spec(&$spec) {
  $spec['case_id'] = array(
    'title' => 'Cases',
    'description' => 'Find activities within specified cases.',
    'type' => 1,
    'FKClassName' => 'CRM_Case_DAO_Case',
    'FKApiName' => 'Case',
    'name' => 'case_id',
    'api.required' => 1,
  );
  $spec['text'] = array(
    'name' => 'text',
    'title' => 'Textual filter',
    'html' => array(
      'type' => 'Text',
      'maxlength' => 64,
      'size' => 64,
    ),
  );
}

/**
 * Case.Getfiles API
 *
 * Perform a search for files related to a case.
 *
 * @param array $params
 * @return array API result descriptor
 * @see civicrm_api3_create_success
 * @see civicrm_api3_create_error
 * @throws API_Exception
 */
function civicrm_api3_case_getfiles($params) {
  // Check authorization.
  // WISHLIST: would be nice to incorporate addSelectWhere() instead?
  _civicrm_api3_case_getfiles_assert_access($params);
  $options = _civicrm_api3_get_options_from_params($params);

  $matches = _civicrm_api3_case_getfiles_find($params, $options);
  $result = civicrm_api3_create_success($matches);
  if (!empty($params['options']['xref'])) {
    $result['xref'] = _civicrm_api3_case_getfiles_xref($matches);
  }
  return $result;
}

/**
 * @param $params
 * @param $options
 * @return array
 *   Ex: array(0 => array('case_id' => 123, 'activity_id' => 456, 'file_id' => 789))
 */
function _civicrm_api3_case_getfiles_find($params, $options) {
  $select = _civicrm_api3_case_getfiles_select($params);

  if (!empty($options['limit'])) {
    $select->limit($options['limit'], isset($options['offset']) ? $options['offset'] : 0);
  }

  $dao = \CRM_Core_DAO::executeQuery($select->toSQL());
  $matches = array();
  while ($dao->fetch()) {
    $matches[$dao->id] = $dao->toArray();
  }
  if (!empty($params['sequential'])) {
    $matches = array_values($matches);
  }
  return $matches;
}

/**
 * @param array $params
 * @return CRM_Utils_SQL_Select
 */
function _civicrm_api3_case_getfiles_select($params) {
  $select = CRM_Utils_SQL_Select::from('civicrm_case_activity caseact')
    ->join('ef', 'INNER JOIN civicrm_entity_file ef ON (ef.entity_table = "civicrm_activity" AND ef.entity_id = caseact.activity_id) ')
    ->join('f', 'INNER JOIN civicrm_file f ON ef.file_id = f.id')
    ->select('caseact.case_id as case_id, caseact.activity_id as activity_id, f.id as id')
    ->distinct();

  if (isset($params['case_id'])) {
    // Isn't there some helper which will let us do more advanced SQL with $params['case_id']?
    $select->where('caseact.case_id = #caseIDs', array(
      'caseIDs' => $params['case_id'],
    ));
  }

  if (isset($params['text'])) {
    $select->join('act', 'INNER JOIN civicrm_activity act ON ((caseact.id = act.id OR caseact.activity_id = act.original_id) AND act.is_current_revision=1)');
    $select->where('act.subject LIKE @q OR act.details LIKE @q OR f.description LIKE @q OR f.uri LIKE @q',
      array('q' => '%' . $params['text'] . '%'));
  }

  $select->orderBy(array('case_id, activity_id, id'));
  return $select;
}

/**
 * Assert that this request is authorized to access the given Case.
 * @param array $params
 * @throws API_Exception
 */
function _civicrm_api3_case_getfiles_assert_access($params) {
  if (empty($params['check_permissions'])) {
    return; // OK
  }

  if (empty($params['case_id'])) {
    throw new API_Exception("Blank case_id cannot be validated");
  }

  // Delegate to Case.get to determine if the ID is accessible.
  civicrm_api3('Case', 'getsingle', array(
    'id' => $params['case_id'],
    'return' => 'id',
  ));
}

/**
 * Lookup any cross-references in the `getfiles` data.
 *
 * @param array $matches
 *   Ex: array(0 => array('case_id' => 123, 'activity_id' => 456, 'id' => 789))
 * @return array
 *   Ex:
 *     $result['case'][123]['case_type_id'] = 3;
 *     $result['activity'][456]['subject'] = 'the subject';
 *     $result['file'][789]['mime_type'] = 'text/plain';
 */
function _civicrm_api3_case_getfiles_xref($matches) {
  $types = array(
    // array(string $idField, string $xrefName, string $apiEntity)
    array('case_id', 'case', 'Case'),
    array('activity_id', 'activity', 'Activity'),
    array('id', 'file', 'Attachment'),
  );

  $result = array();
  foreach ($types as $typeSpec) {
    list ($idField, $xrefName, $apiEntity) = $typeSpec;
    $ids = array_unique(CRM_Utils_Array::collect($idField, $matches));
    // WISH: $result[$xrefName] = civicrm_api3($apiEntity, 'get', array('id'=>array('IN', $ids)))['values'];
    foreach ($ids as $id) {
      $result[$xrefName][$id] = civicrm_api3($apiEntity, 'getsingle', array(
        'id' => $id,
      ));
    }
  }
  return $result;
}
