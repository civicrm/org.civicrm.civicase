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
  $activityFields = civicrm_api3('Activity', 'getfields', array('api_action' => 'get'));
  $spec = $activityFields['values'];
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
function civicrm_api3_activity_Getmonthswithactivities($params)
{
    $result = civicrm_api3('Activity', 'get', array_merge($params, [
      'sequential' => 1,
      'return' => 'activity_date_time',
      'options' => ['limit' => 0],
    ]));

    if (!boolval($result['is_error'])) {
      $grouped_activity_dates = array();
      $grouped_activity_dates_indexes = array();
      $index = 0;

      foreach($result['values'] as $activity_date_time) {
        list($activity_year, $activity_month) = explode('-', $activity_date_time['activity_date_time']);
        
        if (!isset($grouped_activity_dates_indexes[$activity_month . $activity_year])) {
          $grouped_activity_dates_indexes[$activity_month . $activity_year] = $index;
          $index++;
          $grouped_activity_dates[] = array(
            'year' => $activity_year,
            'month' => $activity_month,
          );
        }
      }

      return civicrm_api3_create_success($grouped_activity_dates, $params, 'Activity', 'getmonthswithactivities');
    }

    return civicrm_api3_create_error($result['error_message'], $params);
}
