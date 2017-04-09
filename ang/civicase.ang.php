<?php
// This file declares an Angular module which can be autoloaded
// in CiviCRM. See also:
// http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_angularModules
Civi::resources()
  ->addPermissions(array('administer CiviCase'))
  ->addSetting(array(
    'config' => array(
      'enableComponents' => CRM_Core_Config::singleton()->enableComponents,
      'user_contact_id' => CRM_Core_Session::getLoggedInContactID(),
    ),
  ));
$options = array(
  'activityTypes' => 'activity_type',
  'activityStatuses' => 'activity_status',
  'caseStatuses' => 'case_status',
  'activityCategories' => 'activity_category',
);
foreach ($options as &$option) {
  $result = civicrm_api3('OptionValue', 'get', array(
    'return' => array('value', 'label', 'color', 'icon', 'name', 'grouping'),
    'option_group_id' => $option,
    'is_active' => 1,
    'options' => array('limit' => 0, 'sort' => 'weight'),
  ));
  $option = array();
  foreach ($result['values'] as $item) {
    $key = $item['value'];
    CRM_Utils_Array::remove($item, 'id', 'value');
    $option[$key] = $item;
  }
}
$caseTypes = civicrm_api3('CaseType', 'get', array(
  'return' => array('name', 'title', 'description'),
  'options' => array('limit' => 0, 'sort' => 'weight'),
));
foreach ($caseTypes['values'] as &$item) {
  CRM_Utils_Array::remove($item, 'id', 'definition', 'is_forkable', 'is_forked');
}
$options['caseTypes'] = $caseTypes['values'];
$result = civicrm_api3('RelationshipType', 'get', array(
  'is_active' => 1,
  'options' => array('limit' => 0),
));
$options['relationshipTypes'] = $result['values'];
$options['fileCategories'] = CRM_Civicase_FileCategory::getCategories();
$result = civicrm_api3('CustomGroup', 'get', array(
  'sequential' => 1,
  'return' => array('extends_entity_column_value', 'title'),
  'extends' => 'Case',
  'is_active' => 1,
  'options' => array('sort' => 'weight'),
  'api.CustomField.get' => array(
    'is_active' => 1,
    'is_searchable' => 1,
    'return' => array('label', 'html_type', 'data_type', 'is_search_range', 'filter', 'option_group_id'),
    'options' => array('sort' => 'weight'),
  ),
));
$options['customSearchFields'] = array();
foreach ($result['values'] as $group) {
  if (!empty($group['api.CustomField.get']['values'])) {
    if (!empty($group['extends_entity_column_value'])) {
      $group['caseTypes'] = CRM_Utils_Array::collect('name', array_values(array_intersect_key($caseTypes['values'], array_flip($group['extends_entity_column_value']))));
    }
    $group['fields'] = $group['api.CustomField.get']['values'];
    unset($group['api.CustomField.get']);
    foreach ($group['fields'] as &$field) {
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
              'key' => (string) $key,
              'value' => (string) $val,
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
      $field['is_search_range'] = (bool) CRM_Utils_Array::value('is_search_range', $field);
    }
    $options['customSearchFields'][] = $group;
  }
}
return array(
  'js' => array(
    'ang/civicase.js',
    'ang/civicase/*.js',
  ),
  'css' => array(
    'css/*.css',
    'ang/civicase/*.css',
  ),
  'partials' => array(
    'ang/civicase',
  ),
  'settings' => $options,
);
