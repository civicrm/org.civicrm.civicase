<?php

namespace Civi\CCase;


class Utils {

  /**
   * Gets a list of manager roles for each case type.
   *
   * @return array
   *   [caseTypeId => relationshipTypeId]
   */
  public static function getCaseManagerRelationshipTypes() {
    $ret = array();
    $caseTypes = civicrm_api3('CaseType', 'get', array(
      'options' => array('limit' => 0),
      'return' => array('name', 'definition'),
    ));
    $relationshipTypes = civicrm_api3('RelationshipType', 'get', array(
      'options' => array('limit' => 0),
      'return' => array('name_b_a'),
    ));
    $relationshipTypes = \CRM_Utils_Array::rekey($relationshipTypes['values'], 'name_b_a');
    foreach ($caseTypes['values'] as $caseType) {
      foreach ($caseType['definition']['caseRoles'] as $role) {
        if (!empty($role['manager'])) {
          $ret[$caseType['id']] = $relationshipTypes[$role['name']]['id'];
        }
      }
    }
    return $ret;
  }

}
