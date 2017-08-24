<?php
// This file declares an Angular module which can be autoloaded
// in CiviCRM. See also:
// http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_angularModules
Civi::resources()
  ->addPermissions(array('administer CiviCase', 'administer CiviCRM'))
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
  'return' => array('name', 'title', 'description', 'definition'),
  'options' => array('limit' => 0, 'sort' => 'weight'),
));
foreach ($caseTypes['values'] as &$item) {
  CRM_Utils_Array::remove($item, 'id', 'is_forkable', 'is_forked');
}
$options['caseTypes'] = $caseTypes['values'];
$result = civicrm_api3('RelationshipType', 'get', array(
  'is_active' => 1,
  'options' => array('limit' => 0),
));
$options['relationshipTypes'] = $result['values'];
$options['fileCategories'] = CRM_Civicase_FileCategory::getCategories();
$options['activityStatusTypes'] = array(
  'incomplete' => array_keys(\CRM_Activity_BAO_Activity::getStatusesByType(CRM_Activity_BAO_Activity::INCOMPLETE)),
  'completed' => array_keys(\CRM_Activity_BAO_Activity::getStatusesByType(CRM_Activity_BAO_Activity::COMPLETED)),
  'cancelled' => array_keys(\CRM_Activity_BAO_Activity::getStatusesByType(CRM_Activity_BAO_Activity::CANCELLED)),
);
$result = civicrm_api3('CustomGroup', 'get', array(
  'sequential' => 1,
  'return' => array('extends_entity_column_value', 'title', 'extends'),
  'extends' => array('IN' => array('Case', 'Activity')),
  'is_active' => 1,
  'options' => array('sort' => 'weight'),
  'api.CustomField.get' => array(
    'is_active' => 1,
    'is_searchable' => 1,
    'return' => array('label', 'html_type', 'data_type', 'is_search_range', 'filter', 'option_group_id'),
    'options' => array('sort' => 'weight'),
  ),
));
$options['customSearchFields'] = $options['customActivityFields'] = array();
foreach ($result['values'] as $group) {
  if (!empty($group['api.CustomField.get']['values'])) {
    if ($group['extends'] == 'Case') {
      if (!empty($group['extends_entity_column_value'])) {
        $group['caseTypes'] = CRM_Utils_Array::collect('name', array_values(array_intersect_key($caseTypes['values'], array_flip($group['extends_entity_column_value']))));
      }
      foreach ($group['api.CustomField.get']['values'] as $field) {
        $group['fields'][] = Civi\CCase\Utils::formatCustomSearchField($field);
      }
      unset($group['api.CustomField.get']);
      $options['customSearchFields'][] = $group;
    }
    else {
      foreach ($group['api.CustomField.get']['values'] as $field) {
        $options['customActivityFields'][] = Civi\CCase\Utils::formatCustomSearchField($field) + array('group' => $group['title']);
      }
    }
  }
}
// Case tags
$options['tags'] = CRM_Core_BAO_Tag::getColorTags('civicrm_case');
$options['tagsets'] = CRM_Utils_Array::value('values', civicrm_api3('Tag', 'get', array(
  'sequential' => 1,
  'return' => array("id", "name"),
  'used_for' => array('IN' => array("Cases")),
  'is_tagset' => 1,
)));
// Bulk actions for case list - we put this here so it can be modified by other extensions
$options['caseActions'] = array(
  array(
    'title' => ts('Change Case Status'),
    'action' => 'changeStatus(cases)',
    'icon' => 'fa-pencil-square-o',
  ),
  array(
    'title' => ts('Edit Tags'),
    'action' => 'editTags(cases[0])',
    'icon' => 'fa-tags',
    'number' => 1,
  ),
  array(
    'title' => ts('Print Case'),
    'action' => 'print(cases[0])',
    'number' => 1,
    'icon' => 'fa-print',
  ),
  array(
    'title' => ts('Email Case Manager'),
    'action' => 'emailManagers(cases)',
    'icon' => 'fa-envelope-o',
  ),
  array(
    'title' => ts('Link Cases'),
    'action' => 'linkCases(cases[0])',
    'number' => 1,
    'icon' => 'fa-link',
  ),
  array(
    'title' => ts('Link 2 Cases'),
    'action' => 'linkCases(cases[0], cases[1])',
    'number' => 2,
    'icon' => 'fa-link',
  ),
);
if (CRM_Core_Permission::check('administer CiviCase')) {
  $options['caseActions'][] = array(
    'title' => ts('Merge 2 Cases'),
    'number' => 2,
    'action' => 'mergeCases(cases)',
    'icon' => 'fa-compress',
  );
}
if (CRM_Core_Permission::check('delete in CiviCase')) {
  $options['caseActions'][] = array(
    'title' => ts('Delete Case'),
    'action' => 'deleteCases(cases)',
    'icon' => 'fa-trash',
  );
}
// Contact tasks
$contactTasks = CRM_Contact_Task::permissionedTaskTitles(CRM_Core_Permission::getPermission());
$options['contactTasks'] = array();
foreach (CRM_Contact_Task::$_tasks as $id => $value) {
  if (isset($contactTasks[$id]) && isset($value['url'])) {
    $options['contactTasks'][$id] = $value;
  }
}
// Random setting
$options['allowMultipleCaseClients'] = (bool) Civi::settings()->get('civicaseAllowMultipleClients');
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
  'requires' => array('crmAttachment', 'crmUi', 'crmUtil', 'ngRoute', 'angularFileUpload', 'bw.paging', 'crmRouteBinder', 'crmResource', 'ui.bootstrap', 'uibTabsetClass', 'dialogService'),
  'basePages' => array(),
);
