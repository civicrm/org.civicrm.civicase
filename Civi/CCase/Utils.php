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

  /**
   * Gets a list of manager roles for each case type.
   *
   * @return array
   *   [caseTypeId => relationshipTypeId]
   */
  public static function getCompletedActivityStatuses() {
    $statuses = civicrm_api3('OptionValue', 'get', array(
      'option_group_id' => "activity_status",
      'name' => array('IN' => array('Completed', 'Canceled')),
      'return' => array('value'),
      'sequential' => 1,
    ));
    return \CRM_Utils_Array::collect('value', $statuses['values']);
  }

  /**
   *
   */
  public static function formatCustomSearchField(&$field) {
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
    elseif (!empty($field['filter'])) {
      parse_str($field['filter'], $field['filter']);
      unset($field['filter']['action']);
      if (!empty($field['filter']['group'])) {
        $field['filter']['group'] = explode(',', $field['filter']['group']);
      }
    }
    $field['is_search_range'] = (bool) \CRM_Utils_Array::value('is_search_range', $field);
  }

}
