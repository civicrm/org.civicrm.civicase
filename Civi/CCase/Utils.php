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
   * Gets status ids for completed activities.
   *
   * @return array
   *   [int]
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
