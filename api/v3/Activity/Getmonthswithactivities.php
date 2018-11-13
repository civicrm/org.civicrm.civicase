<?php
use CRM_Civicase_ExtensionUtil as E;

/**
 * Activity.Getmonthswithactivities API specification
 *
 * @param array $spec description of fields supported by this API call
 * 
 * @return void
 * @see http://wiki.civicrm.org/confluence/display/CRMDOC/API+Architecture+Standards
 */
function _civicrm_api3_activity_Getmonthswithactivities_spec(&$spec) {
  $allowed = ['activity_date_time', 'activity_status_id', 'case_id'];
  $all = civicrm_api3('Activity', 'getfields', array('api_action' => 'get'))['values'];
  
  $spec = array_filter($all, function ($name) use ($allowed) {
    return in_array($name, $allowed);
  }, ARRAY_FILTER_USE_KEY);
}

/**
 * Returns list of unique [MM, YYYY] month-year pair with at least an activity
 * 
 * @method Activity.Getmonthswithactivities API
 *
 * @param array $params
 * @return array API result with list of months
 * @see civicrm_api3_create_success
 * @throws API_Exception
 */
function civicrm_api3_activity_Getmonthswithactivities($params) {
  try {
      $dao = CRM_Utils_SQL_Select::from('civicrm_activity a');
      $dao->select(['YEAR(a.activity_date_time) AS year, MONTH(a.activity_date_time) AS month']);

      if (array_key_exists('activity_date_time', $params)) {
          _civicrm_api3_activity_Getmonthswithactivities_handle_id_param($params['activity_date_time'], 'a.activity_date_time', $dao);
      }

      if (array_key_exists('activity_status_id', $params)) {
          _civicrm_api3_activity_Getmonthswithactivities_handle_id_param($params['activity_status_id'], 'a.status_id', $dao);
      }

      if (array_key_exists('case_id', $params)) {
          $dao->join('ca', 'INNER JOIN civicrm_case_activity AS ca ON a.id = ca.activity_id');
          _civicrm_api3_activity_Getmonthswithactivities_handle_id_param($params['case_id'], 'ca.case_id', $dao);
      }

      $dao->groupBy('YEAR(a.activity_date_time), MONTH(a.activity_date_time) ASC');
      $result = $dao->execute()->fetchAll();

      $params['sequential'] = 1;

      return civicrm_api3_create_success($result, $params, 'Activity', 'getmonthswithactivities');
  } catch (Exception $exception) {
    throw new API_Exception($exception->getMessage(), $exception->getCode());
  }
}

/**
 * Creates a WHERE clause with the given API parameter and column name
 *
 * @param array $param
 * @param string $param
 * @param CRM_Utils_SQL_Select $param
 */
function _civicrm_api3_activity_Getmonthswithactivities_handle_id_param($param, $column, $dao) {
  $param = is_array($param) ? $param : array('=' => $param);

  $dao->where(CRM_Core_DAO::createSQLFilter($column, $param));
}
