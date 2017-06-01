<?php

require_once 'civicase.civix.php';

/**
 * Implements hook_civicrm_tabset().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_tabset
 */
function civicase_civicrm_tabset($tabsetName, &$tabs, $context) {
  $useAng = FALSE;

  switch ($tabsetName) {
    case 'civicrm/contact/view':
      foreach ($tabs as &$tab) {
        if ($tab['id'] === 'case') {
          $useAng = TRUE;
          $tab['url'] = CRM_Utils_System::url('civicrm/case/contact-case-tab', array(
            'cid' => $context['contact_id'],
          ));
        }
        if ($tab['id'] === 'activity') {
          $useAng = TRUE;
          $tab['url'] = CRM_Utils_System::url('civicrm/case/contact-act-tab', array(
            'cid' => $context['contact_id'],
          ));
          break; // foreach
        }
      }
      break;

  }

  if ($useAng) {
    $loader = new \Civi\Angular\AngularLoader();
    $loader->setPageName('civicrm/case/a');
    $loader->setModules(array('civicase'));
    $loader->load();
  }
}

/**
 * Implements hook_civicrm_config().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_config
 */
function civicase_civicrm_config(&$config) {
  _civicase_civix_civicrm_config($config);
}

/**
 * Implements hook_civicrm_xmlMenu().
 *
 * @param array $files
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_xmlMenu
 */
function civicase_civicrm_xmlMenu(&$files) {
  _civicase_civix_civicrm_xmlMenu($files);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_install
 */
function civicase_civicrm_install() {
  _civicase_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_uninstall().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_uninstall
 */
function civicase_civicrm_uninstall() {
  _civicase_civix_civicrm_uninstall();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_enable
 */
function civicase_civicrm_enable() {
  _civicase_civix_civicrm_enable();
}

/**
 * Implements hook_civicrm_disable().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_disable
 */
function civicase_civicrm_disable() {
  _civicase_civix_civicrm_disable();
}

/**
 * Implements hook_civicrm_upgrade().
 *
 * @param $op string, the type of operation being performed; 'check' or 'enqueue'
 * @param $queue CRM_Queue_Queue, (for 'enqueue') the modifiable list of pending up upgrade tasks
 *
 * @return mixed
 *   Based on op. for 'check', returns array(boolean) (TRUE if upgrades are pending)
 *                for 'enqueue', returns void
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_upgrade
 */
function civicase_civicrm_upgrade($op, CRM_Queue_Queue $queue = NULL) {
  return _civicase_civix_civicrm_upgrade($op, $queue);
}

/**
 * Implements hook_civicrm_managed().
 *
 * Generate a list of entities to create/deactivate/delete when this module
 * is installed, disabled, uninstalled.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_managed
 */
function civicase_civicrm_managed(&$entities) {
  _civicase_civix_civicrm_managed($entities);
}

/**
 * Implements hook_civicrm_caseTypes().
 *
 * Generate a list of case-types.
 *
 * @param array $caseTypes
 *
 * Note: This hook only runs in CiviCRM 4.4+.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_caseTypes
 */
function civicase_civicrm_caseTypes(&$caseTypes) {
  _civicase_civix_civicrm_caseTypes($caseTypes);
}

/**
 * Implements hook_civicrm_angularModules().
 *
 * Generate a list of Angular modules.
 *
 * Note: This hook only runs in CiviCRM 4.5+. It may
 * use features only available in v4.6+.
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_caseTypes
 */
function civicase_civicrm_angularModules(&$angularModules) {
_civicase_civix_civicrm_angularModules($angularModules);
}

/**
 * Implements hook_civicrm_alterSettingsFolders().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_alterSettingsFolders
 */
function civicase_civicrm_alterSettingsFolders(&$metaDataFolders = NULL) {
  _civicase_civix_civicrm_alterSettingsFolders($metaDataFolders);
}


/**
 * Implements hook_civicrm_buildForm().
 *
 * @param string $formName
 * @param CRM_Core_Form $form
 */
function civicase_civicrm_buildForm($formName, &$form) {
  // Display category option for activity types and activity statuses
  if ($formName == 'CRM_Admin_Form_Options' && in_array($form->getVar('_gName'), array('activity_type', 'activity_status'))) {
    $options = civicrm_api3('optionValue', 'get', array(
      'option_group_id' => 'activity_category',
      'is_active' => 1,
      'options' => array('limit' => 0, 'sort' => 'weight'),
    ));
    $opts = array();
    if ($form->getVar('_gName') == 'activity_status') {
      $placeholder = ts('All');
      // Activity status can also apply to uncategorized activities
      $opts[] = array(
        'id' => 'none',
        'text' => ts('Uncategorized'),
      );
    }
    else {
      $placeholder = ts('Uncategorized');
    }
    foreach ($options['values'] as $opt) {
      $opts[] = array(
        'id' => $opt['name'],
        'text' => $opt['label'],
      );
    }
    $form->add('select2', 'grouping', ts('Activity Category'), $opts, FALSE, array('class' => 'crm-select2', 'multiple' => TRUE, 'placeholder' => $placeholder));
  }
  // Only show relevant statuses when editing an activity
  if (is_a($form, 'CRM_Activity_Form_Activity') && $form->_action & (CRM_Core_Action::ADD + CRM_Core_Action::UPDATE)) {
    if (!empty($form->_activityTypeId) && $form->elementExists('status_id')) {
      $el = $form->getElement('status_id');
      $cat = civicrm_api3('OptionValue', 'getsingle', array(
        'return' => 'grouping',
        'option_group_id' => "activity_type",
        'value' => $form->_activityTypeId,
      ));
      $cat = !empty($cat['grouping']) ? explode(',', $cat['grouping']) : array('none');
      $options = civicrm_api3('OptionValue', 'get', array(
        'return' => array('label', 'value', 'grouping'),
        'option_group_id' => "activity_status",
        'options' => array('limit' => 0, 'sort' => 'weight'),
      ));
      $newOptions = $el->_options = array();
      $newOptions[''] = ts('- select -');
      foreach ($options['values'] as $option) {
        if (empty($option['grouping']) || array_intersect($cat, explode(',', $option['grouping']))) {
          $newOptions[$option['value']] = $option['label'];
        }
      }
      $el->loadArray($newOptions);
    }
  }
  // If js requests a refresh of case data pass that request along
  if (!empty($_REQUEST['civicase_reload'])) {
    $form->civicase_reload = json_decode($_REQUEST['civicase_reload'], TRUE);
  }
}

/**
 * Implements hook_civicrm_postProcess().
 *
 * @param string $formName
 * @param CRM_Core_Form $form
 */
function civicase_civicrm_postProcess($formName, &$form) {
  if (!empty($form->civicase_reload)) {
    $api = civicrm_api3('Case', 'getdetails', array('check_permissions' => 1) + $form->civicase_reload);
    $form->ajaxResponse['civicase_reload'] = $api['values'];
  }
}

/**
 * Implements hook_civicrm_alterAPIPermissions().
 *
 * @link https://docs.civicrm.org/dev/en/master/hooks/hook_civicrm_alterAPIPermissions/
 */
function civicase_civicrm_alterAPIPermissions($entity, $action, &$params, &$permissions) {
  $permissions['case']['get']['getfiles'] = array(
    array('access my cases and activities', 'access all cases and activities'),
    'access uploaded files',
  );
}

/**
 * Implements hook_civicrm_navigationMenu().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_navigationMenu
 *
function civicase_civicrm_navigationMenu(&$menu) {
  _civicase_civix_insert_navigation_menu($menu, NULL, array(
    'label' => ts('The Page', array('domain' => 'org.civicrm.civicase')),
    'name' => 'the_page',
    'url' => 'civicrm/the-page',
    'permission' => 'access CiviReport,access CiviContribute',
    'operator' => 'OR',
    'separator' => 0,
  ));
  _civicase_civix_navigationMenu($menu);
} // */
