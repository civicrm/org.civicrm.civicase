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

  if (isset(Civi::$statics[__FUNCTION__])) {
    return;
  }
  Civi::$statics[__FUNCTION__] = 1;

  Civi::dispatcher()->addListener('civi.api.prepare', array('CRM_Civicase_ActivityFilter', 'onPrepare'), 10);
}

/**
 * Implements hook_civicrm_xmlMenu().
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
 * Implements hook_civicrm_postInstall().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_postInstall
 */
function civicase_civicrm_postInstall() {
  _civicase_civix_civicrm_postInstall();
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
 * Implements hook_civicrm_alterMenu().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_alterMenu
 */
function civicase_civicrm_alterMenu(&$items) {
  $items['civicrm/case/activity']['ids_arguments']['json'][] = 'civicase_reload';
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
 * Implements hook_civicrm_pageRun().
 */
function civicase_civicrm_pageRun(&$page) {
  if ($page instanceof CRM_Case_Page_Tab) {
    // OLD: http://localhost/civicrm/contact/view/case?reset=1&action=view&cid=129&id=51
    // NEW: http://localhost/civicrm/case/a/#/case/list?sf=contact_id.sort_name&sd=ASC&focus=0&cf=%7B%7D&caseId=51&tab=summary&sx=0

    $caseId = CRM_Utils_Request::retrieve('id', 'Positive');
    if ($caseId) {
      $url = CRM_Utils_System::url('civicrm/case/a/', NULL, TRUE,
        "/case/list?sf=id&sd=DESC&focus=0&cf=%7B%7D&caseId={$caseId}&tab=summary&sx=0&cpn=1&cps=25",
        FALSE);
      CRM_Utils_System::redirect($url);
    }
  }
}

/**
 * Implements hook_civicrm_navigationMenu().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_navigationMenu
 */
function civicase_civicrm_navigationMenu(&$menu) {
  /**
   * @var array
   *   Array(string $oldUrl => string $newUrl).
   */
  $rewriteMap = array(
    // Including the default filters isn't strictly necessary. However, if
    // if you omit, then visiting the link will create a dummy entry
    // in the browser history, and it will be hard to press "Back" through
    // the dummy entry.
    'civicrm/case?reset=1' => 'civicrm/case/a/#/case?dtab=0&dme=0',
    'civicrm/case/search?reset=1' => 'civicrm/case/a/#/case/list?sf=contact_id.sort_name&sd=ASC&focus=0&cf=%7B%7D&caseId=&tab=summary&sx=1&cpn=1&cps=25',
  );

  _civicase_menu_walk($menu, function(&$item) use ($rewriteMap) {
    if (isset($item['url']) && isset($rewriteMap[$item['url']])) {
      $item['url'] = $rewriteMap[$item['url']];
    }
  });
}

/**
 * Visit every link in the navigation menu, and alter it using $callback.
 *
 * @param array $menu
 *   Tree of menu items, per hook_civicrm_navigationMenu.
 * @param callable $callback
 *   Function(&$item).
 */
function _civicase_menu_walk(&$menu, $callback) {
  foreach (array_keys($menu) as $key) {
    if (isset($menu[$key]['attributes'])) {
      $callback($menu[$key]['attributes']);
    }

    if (isset($menu[$key]['child'])) {
      _civicase_menu_walk($menu[$key]['child'], $callback);
    }
  }
}

/**
 * Implements hook_civicrm_coreResourceList().
 */
function civicase_civicrm_coreResourceList(&$items, $region) {
  if ($region == 'html-header') {
    
    CRM_Core_Resources::singleton()->addScriptFile('org.civicrm.shoreditch', 'base/js/affix.js', 1000, 'html-header');
  }
}
