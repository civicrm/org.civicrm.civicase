<?php
require_once 'api/v3/Case.php';

/**
 * Case.getdetails API specification
 *
 * @param array $spec description of fields supported by this API call
 * @return void
 */
function _civicrm_api3_case_getdetails_spec(&$spec) {
  $result = civicrm_api3('Case', 'getfields', array('api_action' => 'get'));
  $spec = $result['values'];
}

/**
 * Case.getdetails API
 *
 * This is provided by the CiviCase extension. It gives more robust output than the regular get action.
 *
 * @param array $params
 * @return array API result
 * @throws API_Exception
 */
function civicrm_api3_case_getdetails($params) {
  $params += array('return' => array());
  if (is_string($params['return'])) {
    $params['return'] = explode(',', str_replace(' ', '', $params['return']));
  }
  $toReturn = $params['return'];
  $extraReturnProperties = array('activity_summary', 'last_update');
  $params['return'] = array_diff($params['return'], $extraReturnProperties);
  $result = civicrm_api3_case_get(array('sequential' => 0) + $params);
  if (!empty($result['values'])) {
    $ids = array_keys($result['values']);

    // Get activity summary
    if (in_array('activity_summary', $toReturn)) {
      $categories = array_fill_keys(array('alert', 'milestone', 'task'), array());
      foreach ($result['values'] as &$case) {
        $case['activity_summary'] = $categories + array('overdue' => array());
      }
      $allTypes = array();
      foreach (array_keys($categories) as $grouping) {
        $option = civicrm_api3('OptionValue', 'get', array(
          'return' => array('value'),
          'option_group_id' => 'activity_type',
          'grouping' => array('LIKE' => "%{$grouping}%"),
          'options' => array('limit' => 0),
        ));
        foreach ($option['values'] as $val) {
          $categories[$grouping][] = $allTypes[] = $val['value'];
        }
      }
      $activities = civicrm_api3('Activity', 'get', array(
        'return' => array('activity_type_id', 'subject', 'activity_date_time', 'status_id', 'case_id'),
        'check_permissions' => !empty($params['check_permissions']),
        'case_id' => array('IN' => $ids),
        'is_current_revision' => 1,
        'is_test' => 0,
        'status_id' => array('!=' => 'Completed'),
        'activity_type_id' => array('IN' => array_unique($allTypes)),
        'activity_date_time' => array('<' => 'now'),
        'options' => array(
          'limit' => 0,
          'sort' => 'activity_date_time',
          'or' => array(array('activity_date_time', 'activity_type_id')),
        ),
      ));
      foreach ($activities['values'] as $act) {
        $case =& $result['values'][$act['case_id']];
        foreach ($categories as $category => $grouping) {
          if (in_array($act['activity_type_id'], $grouping)) {
            $case['activity_summary'][$category][] = $act;
          }
        }
        if (strtotime($act['activity_date_time']) < time()) {
          $case['activity_summary']['overdue'][] = $act;
        }
      }
    }
    // Get last update
    if (in_array('last_update', $toReturn)) {
      // todo
    }
    if (!empty($params['sequential'])) {
      $result['values'] = array_values($result['values']);
    }
  }
  return $result;
}
