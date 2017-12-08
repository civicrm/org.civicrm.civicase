<?php

/**
 * Class CRM_CiviCase_Utils_Hook
 *
 * Implements hook to alter the content of case tables.
 */
class CRM_Civicase_Utils_Hook {

  /**
   * Allows to alter case dashboard tables by adding or removing columns to the
   * table.
   *
   * @param array $headers
   *   List of columns in the table, of the form ['column_name' => 'Column Label']
   * @param $cases
   *   List of cases to be shown
   *
   * @return mixed
   */
  public static function alterCaseTable(&$headers, &$cases) {
    return CRM_Utils_Hook::singleton()->invoke(
      array('headers', 'cases'),
      $headers,
      $cases,
      CRM_Utils_Hook::$_nullObject,
      CRM_Utils_Hook::$_nullObject,
      CRM_Utils_Hook::$_nullObject,
      CRM_Utils_Hook::$_nullObject,
      'civicrm_alterCaseTable'
    );
  }

}
