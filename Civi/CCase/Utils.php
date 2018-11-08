<?php

namespace Civi\CCase;


class Utils {

  /**
   * Gets a list of case roles (relationship) types foe each case type.
   *
   * @param String $type of relationship.
   *
   * @return array
   *   [caseTypeId => relationshipTypeId]
   */
  public static function getRelationshipTypesListByCaseRole($roleName) {
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
      $caseTypeToCaseRolesList = array();
      foreach ($caseType['definition']['caseRoles'] as $role) {
        if ($roleName == 'involved') {
          $caseTypeToCaseRolesList[] =  $relationshipTypes[$role['name']]['id'];
        } else {
          if (!empty($role[$roleName])) {
            $caseTypeToCaseRolesList[] = $relationshipTypes[$role['name']]['id'];
          }
        }
      }
      $ret[$caseType['id']] = $caseTypeToCaseRolesList;
    }

    return $ret;
  }


  /**
   * Adds a join with relationships
   * This is done to get all records where the relationship is associated with a case.
   *
   * @param \CRM_Utils_SQL_Select $sql
   * @param String $relationship
   */
  public static function joinOnRelationship($sql, $relationship) {
    $caseTypeToRelationshipList = self::getRelationshipTypesListByCaseRole($relationship);
    $relationshipTypeClause = array();

    foreach ($caseTypeToRelationshipList as $caseTypeId => $relationshipTypeIds) {
      foreach ($relationshipTypeIds as $index => $relationshipTypeId) {
        $relationshipTypeClause[] = "(a.case_type_id = {$caseTypeId} AND {$relationship}_relationship.relationship_type_id = {$relationshipTypeId})";
      }
    }
    // Creates  OR relationship string with the casetype <-> relationship list.
    $relationshipTypeClause = implode(' OR ', $relationshipTypeClause);
    // Selects uniques cases<->contact link/relationship for each case
    $sql->join("ccc", "LEFT JOIN (SELECT * FROM civicrm_case_contact WHERE id IN (SELECT MIN(id) FROM civicrm_case_contact GROUP BY case_id)) AS ccc ON ccc.case_id = a.id");
    // Joins (get records) where the relationship type clause (case-type <-> relationship type)  lies in relation a to b)
    $sql->join("{$relationship}_relationship", "LEFT JOIN civicrm_relationship AS {$relationship}_relationship ON ccc.contact_id = {$relationship}_relationship.contact_id_a AND {$relationship}_relationship.is_active AND ({$relationshipTypeClause}) AND {$relationship}_relationship.case_id = a.id");
    // Join where selected contact lie in relationship b to a  (case_manager)
    $sql->join("{$relationship}", "LEFT JOIN civicrm_contact AS {$relationship} ON {$relationship}_relationship.contact_id_b = {$relationship}.id AND {$relationship}.is_deleted <> 1");
  }

  /**
   *
   */
  public static function formatCustomSearchField($field) {
    if ($field['html_type'] != 'Autocomplete-Select') {
      $opts = civicrm_api('Case', 'getoptions', array(
        'version' => 3,
        'field' => "custom_{$field['id']}",
      ));
      if (!empty($opts['values'])) {
        $field['options'] = array();
        // Javascript doesn't like php's fast & loose type switching; ensure everything is a string
        foreach ($opts['values'] as $key => $val) {
          $field['options'][] = array(
            'id' => (string) $key,
            'text' => (string) $val,
          );
        }
      }
    }
    // For contact ref fields
    elseif ($field['data_type'] == 'ContactReference') {
      $field['entity'] = 'Contact';
      $field['api_params'] = array();
      if (!empty($field['filter'])) {
        parse_str($field['filter'], $field['api_params']);
        unset($field['api_params']['action']);
        if (!empty($field['api_params']['group'])) {
          $field['api_params']['group'] = explode(',', $field['api_params']['group']);
        }
      }
    }
    else {
      $field['entity'] = 'OptionValue';
      $field['api_params'] = array(
        'option_group_id' => $field['option_group_id'],
        'option_sort' => 'weight',
      );
    }
    unset($field['filter'], $field['option_group_id']);
    $field['name'] = "custom_{$field['id']}";
    $field['is_search_range'] = (bool) \CRM_Utils_Array::value('is_search_range', $field);
    return $field;
  }

}
