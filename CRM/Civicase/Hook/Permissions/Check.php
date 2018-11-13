<?php

/**
 * Alters permissions checks.
 */
class CRM_Civicase_Hook_Permissions_Check {

  /**
   * Validates permission, checking if page being viewed is activity detail page
   * and if current logged in user is locked out from cases associated to the
   * activity.
   *
   * @param string $permission
   * @param bool $granted
   *
   * @return bool
   */
  public function validatePermission($permission, $granted) {
    if ($permission == 'access all cases and activities' || $permission == 'access my cases and activities') {
      if ($this->isAccessingActivityPageView() && $this->isCurrentUserLockedOut()) {
        return FALSE;
      }
    }

    return $granted;
  }

  /**
   * Checks request to see if page being accessed is an activity detail view.
   *
   * @return bool
   */
  public function isAccessingActivityPageView() {
    $action = CRM_Utils_Request::retrieveValue('action', 'String');
    $activityID = CRM_Utils_Request::retrieveValue('id', 'Integer');

    if ($action == CRM_Core_Action::VIEW && intval($activityID) > 0) {
      return TRUE;
    }

    return FALSE;
  }

  /**
   * Uses activity being viewed and logged in user to see if user is locked out
   * of case.
   *
   * @return bool
   */
  public function isCurrentUserLockedOut() {
    $loggedContactID = CRM_Core_Session::singleton()->getLoggedInContactID();
    $activityID = CRM_Utils_Request::retrieveValue('id', 'Integer');

    $result = civicrm_api3('CaseContactLock', 'get', array(
      'contact_id' => $loggedContactID,
      'api.Activity.getcount' => array('case_id' => '$value.case_id', 'id' => $activityID),
      'options' => array('limit' => 0),
    ));

    foreach ($result['values'] as $currentCase) {
      if (intval($currentCase['api.Activity.getcount']) > 0) {
        return TRUE;
      }
    }

    return FALSE;
  }

}
