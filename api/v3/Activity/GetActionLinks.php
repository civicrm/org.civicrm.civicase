<?php

/**
 * Activity.GetActionLinks API specification (optional)
 * This is used for documentation and validation.
 *
 * @param array $spec description of fields supported by this API call
 * @return void
 * @see http://wiki.civicrm.org/confluence/display/CRMDOC/API+Architecture+Standards
 */
function _civicrm_api3_activity_GetActionLinks_spec(&$spec) {
  $spec['activity_type_id']['api.required'] = 1;
  $spec['source_record_id']['api.required'] = 1;
  $spec['activity_id']['api.required'] = 1;
  $spec['case_id']['api.required'] = 0;
}

/**
 * Activity.GetActionLinks API
 * This API returns the activity action links for an activity record.
 * Basically it adds the action links added by core plus the action links
 * added by various extensions via hooks. Action links differ per activity
 * as some logic may determine which links are available for a particular activity.
 *
 * @param array $params
 *
 * @return array
 */
function civicrm_api3_activity_GetActionLinks($params) {
  return _civicrm_api3_activity_getActivityActionLinks($params);
}

/**
 * Returns activity links for the activity ID in the params.
 *
 * @param array $params
 *
 * @return array
 */
function _civicrm_api3_activity_getActivityActionLinks($params) {
  $actionLinks = CRM_Activity_Selector_Activity::actionLinks(
    CRM_Utils_Array::value('activity_type_id', $params),
    CRM_Utils_Array::value('source_record_id', $params),
    FALSE,
    CRM_Utils_Array::value('activity_id', $params)
  );

  $actionMask = array_sum(array_keys($actionLinks));

  $seqLinks = array();
  foreach ($actionLinks as $bit => $link) {
    $link['bit'] = $bit;
    $seqLinks[] = $link;
  }

  $values = array(
    'id' => $params['activity_id'],
    'cid' => CRM_Core_Session::getLoggedInContactID(),
    'cxt' => '',
    'caseid' => CRM_Utils_Array::value('case_id', $params),
  );

  //Invoke hook links for activity tab rows.
  CRM_Utils_Hook::links(
    'activity.tab.row',
    'Activity',
    $params['activity_id'],
    $seqLinks,
    $actionMask,
    $values
  );

 return  _civicrm_api3_activity_GetActionLinks_processLinks($seqLinks);
}

/**
 * Process activity links
 *
 * @param array $activityActionLinks
 *
 * @return array
 */
function _civicrm_api3_activity_GetActionLinks_processLinks($activityActionLinks) {
  foreach($activityActionLinks as $id => $link) {

    //remove action links already added by civicase
    if (in_array($link['name'], ['Delete', 'File on Case', 'Edit'])) {
      unset($activityActionLinks[$id]);
      continue;
    }

    //format link URL
    if (isset($link['qs']) && !CRM_Utils_System::isNull($link['qs'])) {
      $urlPath = CRM_Utils_System::url(CRM_Core_Action::replace($link['url'], $values),
        CRM_Core_Action::replace($link['qs'], $values), FALSE, NULL, TRUE
      );
    }
    else {
      $urlPath = CRM_Utils_Array::value('url', $link, '#');
    }

    $activityActionLinks[$id]['url'] = $urlPath;

    // Add link classes
    $classes = 'action-item';
    if (isset($link['ref'])) {
      $classes .= ' ' . strtolower($link['ref']);
    }

    if (isset($link['class'])) {
      $className = is_array($link['class']) ? implode(' ', $link['class']) : $link['class'];
      $classes .= ' ' . strtolower($className);
    }

    $activityActionLinks[$id]['class'] = $classes;
  }

  return $activityActionLinks;
}
