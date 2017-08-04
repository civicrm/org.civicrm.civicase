<?php

/**
 * Collection of upgrade steps.
 */
class CRM_Civicase_Upgrader extends CRM_Civicase_Upgrader_Base {

  // By convention, functions that look like "function upgrade_NNNN()" are
  // upgrade tasks. They are executed in order (like Drupal's hook_update_N).

  /**
   * Tasks to perform when the module is installed.
   */
  public function install() {
    CRM_Core_BAO_ConfigSetting::enableComponent('CiviCase');

    // Set activity categories
    $communicationTypes = civicrm_api3('OptionValue', 'get', array(
      'return' => array('id'),
      'option_group_id' => 'activity_type',
      'name' => array('IN' => array("Meeting", "Phone Call", "Email", "SMS", "Inbound Email", "Follow up")),
    ));
    foreach ($communicationTypes['values'] as $type) {
      civicrm_api3('OptionValue', 'setvalue', array('id' => $type['id'], 'field' => 'grouping', 'value' => 'communication'));
    }

    // Create activity types
    $this->addOptionValue(array(
      'option_group_id' => 'activity_type',
      'label' => ts('Alert'),
      'name' => 'Alert',
      'grouping' => 'alert',
      'is_reserved' => 0,
      'description' => ts('Alerts to display in cases'),
      'component_id' => 'CiviCase',
      'icon' => 'fa-exclamation',
    ));
    $this->addOptionValue(array(
      'option_group_id' => 'activity_type',
      'label' => ts('File Upload'),
      'name' => 'File Upload',
      // 'grouping' => '',
      'is_reserved' => 0,
      'description' => ts('Add files to a case'),
      'component_id' => 'CiviCase',
      'icon' => 'fa-file',
    ));
    $this->addOptionValue(array(
      'option_group_id' => 'activity_type',
      'label' => ts('Remove Client From Case'),
      'name' => 'Remove Client From Case',
      'is_reserved' => 0,
      'description' => ts('Client removed from multi-client case'),
      'component_id' => 'CiviCase',
      'icon' => 'fa-user-times',
    ));

    // Create activity statuses
    $this->addOptionValue(array(
      'option_group_id' => 'activity_status',
      'label' => ts('Unread'),
      'name' => 'Unread',
      'grouping' => 'communication',
      'is_reserved' => 0,
      'color' => '#d9534f',
    ));
    $this->addOptionValue(array(
      'option_group_id' => 'activity_status',
      'label' => ts('Draft'),
      'name' => 'Draft',
      'grouping' => 'communication',
      'is_reserved' => 0,
      'color' => '#c2cfd8',
    ));

    // Set grouping for existing statuses
    $allowedStatuses = array(
      'Scheduled' => 'none,task,file,communication,milestone',
      'Completed' => 'none,task,file,communication,milestone,alert',
      'Cancelled' => 'none,communication,milestone,alert',
      'Left Message' => 'none,communication,milestone',
      'Unreachable' => 'none,communication,milestone',
      'Not Required' => 'none,task,milestone',
      'Available' => 'none,milestone',
      'No_show' => 'none,milestone',
    );
    foreach ($allowedStatuses as $status => $grouping) {
      civicrm_api3('OptionValue', 'get', array(
        'option_group_id' => 'activity_status',
        'name' => $status,
        'api.OptionValue.setvalue' => array(
          'field' => 'grouping',
          'value' => $grouping,
        ),
      ));
    }

    // Set status colors
    $colors = array(
      'activity_status' => array(
        'Scheduled' => '#42afcb',
        'Completed' => '#8ec68a',
        'Left Message' => '#eca67f',
        'Available' => '#5bc0de',
      ),
      'case_status' => array(
        'Open' => '#42afcb',
        'Closed' => '#4d5663',
        'Urgent' => '#e6807f',
      ),
    );
    foreach ($colors as $optionGroup => $statuses) {
      foreach ($statuses as $status => $color) {
        civicrm_api3('OptionValue', 'get', array(
          'option_group_id' => $optionGroup,
          'name' => $status,
          'api.OptionValue.setvalue' => array(
            'field' => 'color',
            'value' => $color,
          ),
        ));
      }
    }

    if (Civi::settings()->get('civicaseAllowMultipleClients') === 'default') {
      Civi::settings()->set('civicaseAllowMultipleClients', '1');
    }

    if (!Civi::settings()->hasExplict('recordGeneratedLetters')) {
      Civi::settings()->set('recordGeneratedLetters', 'combined-attached');
    }

    $this->upgrade_0001();
  }

  public function upgrade_0001() {
    $this->addNav(array(
      'label' => ts('Manage Cases', array('domain' => 'org.civicrm.civicase')),
      'name' => 'manage_cases',
      'url' => 'civicrm/case/a/#/case/list?sf=contact_id.sort_name&sd=ASC&focus=0&cf=%7B%7D&caseId=&tab=summary&sx=0&cpn=1&cps=25',
      'permission' => 'access my cases and activities,access all cases and activities',
      'operator' => 'OR',
      'separator' => 0,
      'parent_name' => 'Cases',
    ));
    CRM_Core_BAO_Navigation::resetNavigation();
    return TRUE;
  }

  /**
   * Tasks to perform after the module is installed.
   */
  public function postInstall() {
  }

  /**
   * Remove extension data when uninstalled.
   */
  public function uninstall() {
    try {
      civicrm_api3('OptionValue', 'get', array(
        'return' => array('id'),
        'option_group_id' => 'activity_category',
        'options' => array('limit' => 0),
        'api.OptionValue.delete' => array(),
      ));
    }
    catch (Exception $e) {}
    try {
      civicrm_api3('OptionGroup', 'get', array(
        'return' => array('id'),
        'name' => 'activity_category',
        'api.OptionGroup.delete' => array(),
      ));
    }
    catch (Exception $e) {}
    // Delete unused activity types
    foreach (array('File', 'Alert') as $type) {
      try {
        $acts = civicrm_api3('Activity', 'getcount', array(
          'activity_type_id' => $type,
        ));
        if (empty($acts['result'])) {
          civicrm_api3('OptionValue', 'get', array(
            'return' => array('id'),
            'option_group_id' => 'activity_type',
            'name' => $type,
            'api.OptionValue.delete' => array(),
          ));
        }
      }
      catch (Exception $e) {}
    }
    // Delete unused activity statuses
    foreach (array('Unread', 'Draft') as $status) {
      try {
        $acts = civicrm_api3('Activity', 'getcount', array(
          'status_id' => $status,
        ));
        if (empty($acts['result'])) {
          civicrm_api3('OptionValue', 'get', array(
            'return' => array('id'),
            'option_group_id' => 'activity_status',
            'name' => $status,
            'api.OptionValue.delete' => array(),
          ));
        }
      }
      catch (Exception $e) {}
    }

    $this->removeNav('manage_cases');
  }

  /**
   * Adds an option value if it doesn't already exist.
   *
   * Weight and value are calculated as needed.
   *
   * @param $params
   */
  protected function addOptionValue($params) {
    $optionGroup = $params['option_group_id'];
    $existing = civicrm_api3('OptionValue', 'get', array(
      'option_group_id' => $optionGroup,
      'name' => $params['name'],
      'return' => 'id',
      'options' => array('limit' => 1),
    ));
    if (!empty($existing['id'])) {
      $params['id'] = $existing['id'];
    }
    else {
      if (empty($params['value'])) {
        $sql = "SELECT MAX(ROUND(value)) + 1 FROM civicrm_option_value WHERE option_group_id = (SELECT id FROM civicrm_option_group WHERE name = '$optionGroup')";
        $params['value'] = CRM_Core_DAO::singleValueQuery($sql);
      }
      $sql = "SELECT MAX(ROUND(weight)) + 1 FROM civicrm_option_value WHERE option_group_id = (SELECT id FROM civicrm_option_group WHERE name = '$optionGroup')";
      $params['weight'] = CRM_Core_DAO::singleValueQuery($sql);
    }
    civicrm_api3('OptionValue', 'create', $params);
  }

  /**
   * @param array $menuItem
   */
  public function addNav($menuItem) {
    $this->removeNav($menuItem['name']);

    $menuItem['is_active'] = 1;
    $menuItem['parent_id'] = CRM_Core_DAO::getFieldValue('CRM_Core_DAO_Navigation', $menuItem['parent_name'], 'id', 'name');
    unset($menuItem['parent_name']);
    CRM_Core_BAO_Navigation::add($menuItem);
  }

  /**
   * @param string $name
   *   The name of the item in `civicrm_navigation`.
   */
  protected function removeNav($name) {
    CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name IN ('%s')", array(
      1 => array($name, 'String'),
    ));
  }

  /**
   * Example: Run a simple query when a module is enabled.
   *
  public function enable() {
    CRM_Core_DAO::executeQuery('UPDATE foo SET is_active = 1 WHERE bar = "whiz"');
  }

  /**
   * Example: Run a simple query when a module is disabled.
   *
  public function disable() {
    CRM_Core_DAO::executeQuery('UPDATE foo SET is_active = 0 WHERE bar = "whiz"');
  }

  /**
   * Example: Run a couple simple queries.
   *
   * @return TRUE on success
   * @throws Exception
   *
  public function upgrade_4200() {
    $this->ctx->log->info('Applying update 4200');
    CRM_Core_DAO::executeQuery('UPDATE foo SET bar = "whiz"');
    CRM_Core_DAO::executeQuery('DELETE FROM bang WHERE willy = wonka(2)');
    return TRUE;
  } // */


  /**
   * Example: Run a slow upgrade process by breaking it up into smaller chunk.
   *
   * @return TRUE on success
   * @throws Exception
  public function upgrade_4202() {
    $this->ctx->log->info('Planning update 4202'); // PEAR Log interface

    $this->addTask(ts('Process first step'), 'processPart1', $arg1, $arg2);
    $this->addTask(ts('Process second step'), 'processPart2', $arg3, $arg4);
    $this->addTask(ts('Process second step'), 'processPart3', $arg5);
    return TRUE;
  }
  public function processPart1($arg1, $arg2) { sleep(10); return TRUE; }
  public function processPart2($arg3, $arg4) { sleep(10); return TRUE; }
  public function processPart3($arg5) { sleep(10); return TRUE; }
  // */


  /**
   * Example: Run an upgrade with a query that touches many (potentially
   * millions) of records by breaking it up into smaller chunks.
   *
   * @return TRUE on success
   * @throws Exception
  public function upgrade_4203() {
    $this->ctx->log->info('Planning update 4203'); // PEAR Log interface

    $minId = CRM_Core_DAO::singleValueQuery('SELECT coalesce(min(id),0) FROM civicrm_contribution');
    $maxId = CRM_Core_DAO::singleValueQuery('SELECT coalesce(max(id),0) FROM civicrm_contribution');
    for ($startId = $minId; $startId <= $maxId; $startId += self::BATCH_SIZE) {
      $endId = $startId + self::BATCH_SIZE - 1;
      $title = ts('Upgrade Batch (%1 => %2)', array(
        1 => $startId,
        2 => $endId,
      ));
      $sql = '
        UPDATE civicrm_contribution SET foobar = whiz(wonky()+wanker)
        WHERE id BETWEEN %1 and %2
      ';
      $params = array(
        1 => array($startId, 'Integer'),
        2 => array($endId, 'Integer'),
      );
      $this->addTask($title, 'executeSql', $sql, $params);
    }
    return TRUE;
  } // */

}
