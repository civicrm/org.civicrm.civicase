<?php
use CRM_Civicase_ExtensionUtil as E;

class CRM_Civicase_BAO_CivicaseContactLock extends CRM_Civicase_DAO_CivicaseContactLock {

  /**
   * Create a new CivicaseContactLock based on array-data
   *
   * @param array $params
   *   key-value pairs
   *
   * @return CRM_Civicase_DAO_CivicaseContactLock|NULL
   */
  public static function create($params) {
    $className = 'CRM_Civicase_DAO_CivicaseContactLock';
    $entityName = 'CivicaseContactLock';
    $hook = empty($params['id']) ? 'create' : 'edit';

    CRM_Utils_Hook::pre($hook, $entityName, CRM_Utils_Array::value('id', $params), $params);

    $instance = new $className();
    $instance->copyValues($params);
    $instance->save();

    CRM_Utils_Hook::post($hook, $entityName, $instance->id, $instance);

    return $instance;
  }

  /**
   * Create locks for the given contact for each case.
   *
   * @param array $cases
   * @param array $contacts
   *
   * @return array
   * @throws \API_Exception
   */
  public static function createLocks($cases, $contacts) {
    $result = array();

    if (is_array($cases) && is_array($contacts)) {
      foreach ($cases as $caseID) {
        foreach ($contacts as $contactID) {
          $lockDAO = self::create(array(
            'case_id' => $caseID,
            'contact_id' => $contactID,
          ));

          $result[] = $lockDAO->toArray();
        }
      }

      return $result;
    } else {
      throw new API_Exception('Cases and contacts input parameters have to be arrays.');
    }
  }

}
