<?php


class CRM_Civicase_BAO_Query extends CRM_Contact_BAO_Query_Interface {
  public function &getFields() {
    $fields = array();

    return $fields;
  }

  public function from($fieldName, $mode, $side) {
    if ($fieldName == 'civicase_contactlock') {
      $loggedContactID = CRM_Core_Session::singleton()->getLoggedInContactID();

      return " 
        $side JOIN (
          SELECT DISTINCT civicrm_case_activity.activity_id AS activity_lock
          FROM civicrm_case_activity, civicase_contactlock
          WHERE civicase_contactlock.case_id = civicrm_case_activity.case_id
          AND civicase_contactlock.contact_id = $loggedContactID
        ) caselock ON caselock.activity_lock = civicrm_activity.id
      ";
    }

    return '';
  }

  public function where(&$query) {
    if ($query->_mode == CRM_Contact_BAO_QUERY::MODE_ACTIVITY) {

      $query->_where[0][] = CRM_Contact_BAO_Query::buildClause("activity_lock", 'IS NULL');
      $query->_tables['civicase_contactlock'] = $query->_whereTables['civicase_contactlock'] = 1;
    }
  }

  public function getPanesMapper(&$panes) {

  }
}
