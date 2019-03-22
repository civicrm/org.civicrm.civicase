<?php

/**
 * Case.Getrelations API specification (optional)
 * This is used for documentation and validation.
 *
 * @param array $spec description of fields supported by this API call
 *
 * @return void
 * 
 * @see http://wiki.civicrm.org/confluence/display/CRMDOC/API+Architecture+Standards
 */
function _civicrm_api3_case_getwebforms_spec(&$spec) {
}

/**
 * Case.Getrelations API
 *
 * Search for webforms that have a atleast 1 case attached to it.
 *
 * @param array $params
 *
 * @return array API result
 *
 * @throws API_Exception
 */
function civicrm_api3_case_getwebforms($params) {
  $webforms = array();
  $sysInfo = civicrm_api3('System', 'get')['values'][0];
  if (!isset($sysInfo['uf']) || $sysInfo['uf'] != 'Drupal') {
    $out = civicrm_api3_create_success(array());
    $out['warning_message'] = 'Only Drupal CMS is supported!';
    return $out;
  }
  if (!module_exists('webform_civicrm')) {
    $out = civicrm_api3_create_success(array());
    $out['warning_message'] = '<p>Webform CiviCRM Drupal module is not installed</p>
      <ul><li>In order to link Drupal Webforms directly from CiviCase you need to install the following Drupal module: 
      <a href="https://www.drupal.org/project/webform_civicrm">webform_civicrm</a>.</li></ul>';
    return $out;
  }
  $query = "SELECT a.nid, a.data, n.title
          FROM webform_civicrm_forms a
          INNER JOIN node n ON a.nid = n.nid";
  db_set_active('default');
  $daos = db_query($query);
  db_set_active('civicrm');
  foreach ($daos as $dao) {
    $data = unserialize($dao->data);
    if ($data['case']['number_of_case'] >= 0) {
      $webforms[] = array(
        'nid' => $dao->nid,
        'title' => $dao->title,
        'path' => drupal_get_path_alias('node/'.$dao->nid)
      );
    }
  }

  $out = civicrm_api3_create_success(array_filter($webforms), $params, 'Case', 'getwebforms');
  $out['count'] = count($webforms);
  return $out;
}
