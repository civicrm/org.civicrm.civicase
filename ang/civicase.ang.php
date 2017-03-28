<?php
// This file declares an Angular module which can be autoloaded
// in CiviCRM. See also:
// http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_angularModules
Civi::resources()->addSetting(array(
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
$result = civicrm_api3('CaseType', 'get', array(
  'return' => array('name', 'title', 'description'),
  'options' => array('limit' => 0, 'sort' => 'weight'),
));
foreach ($result['values'] as &$item) {
  CRM_Utils_Array::remove($item, 'id', 'definition', 'is_forkable', 'is_forked');
}
$options['caseTypes'] = $result['values'];
$result = civicrm_api3('RelationshipType', 'get', array(
  'is_active' => 1,
  'options' => array('limit' => 0),
));
$options['relationshipTypes'] = $result['values'];
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
