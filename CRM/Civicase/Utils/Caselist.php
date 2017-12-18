<?php

/**
 * Created by PhpStorm.
 * User: Usuario
 * Date: 15/12/2017
 * Time: 12:18 PM
 */
class CRM_Civicase_Utils_Caselist {

  /**
   * List of default headers allowed to be seen on case list table.
   *
   * @var array
   */
  private static $defaultHeaders = array();

  public static function getAllowedHeaders() {
    if (empty(self::$defaultHeaders)) {
      self::$defaultHeaders = array(
        array(
          'name' => 'next_activity',
          'label' => ts('Next Activity'),
          'sort' => 'next_activity',
        ),
        array(
          'name' => 'subject',
          'label' => ts('Subject'),
          'sort' => 'subject',
        ),
        array(
          'name' => 'status',
          'label' => ts('Status'),
          'sort' => 'status_id.label',
        ),
        array(
          'name' => 'case_type',
          'label' => ts('Type'),
          'sort' => 'case_type_id.title',
        ),
        array(
          'name' => 'manager',
          'label' => ts('Case Manager'),
          'sort' => 'case_manager.sort_name',
        ),
        array(
          'name' => 'start_date',
          'label' => ts('Start Date'),
          'sort' => 'start_date',
        ),
        array(
          'name' => 'modified_date',
          'label' => ts('Last Updated'),
          'sort' => 'modified_date',
        ),
        array(
          'name' => 'myRole',
          'label' => ts('My Role'),
          'sort' => 'my_role.label_b_a',
        ),
      );
    }

    return array(
      'values' => self::$defaultHeaders
    );
  }

  public function getCaseList($params) {
    $loggedContactID = CRM_Core_Session::singleton()->getLoggedInContactID();

    $defaultAPIReturnedColumns = array(
      'subject', 'case_type_id', 'status_id', 'is_deleted', 'start_date',
      'modified_date', 'contacts', 'activity_summary', 'category_count',
      'tag_id.name', 'tag_id.color', 'tag_id.description',
    );
    $params['return'] = (isset($params['return']) ? array_merge($defaultAPIReturnedColumns, $params['return']) : $defaultAPIReturnedColumns);
    $cases = civicrm_api3('Case', 'getdetails', $params);

    foreach ($cases['values'] as &$case) {
      foreach ($case['contacts'] as $contact) {
        if ($contact['manager'] == 1) {
          $case['manager'] = $contact;
        }

        if ($loggedContactID == $contact['contact_id']) {
          $case['myRole'][] = $contact['role'];
        }
      }
    }

    return $cases;
  }

}
