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
    $categories = array(
      'milestone' => array(
        'Open Case',
      ),
      'communication' => array(
        'Meeting',
        'Phone Call',
        'Email',
        'SMS',
        'Inbound Email',
        'Follow up',
        'Print PDF Letter',
      ),
      'system' => array(
        'Change Case Type',
        'Change Case Status',
        'Change Case Subject',
        'Change Custom Data',
        'Change Case Start Date',
        'Assign Case Role',
        'Remove Case Role',
        'Merge Case',
        'Reassigned Case',
        'Link Cases',
        'Change Case Tags',
        'Add Client To Case',
      ),
    );
    foreach ($categories as $grouping => $activityTypes) {
      civicrm_api3('OptionValue', 'get', array(
        'return' => 'id',
        'option_group_id' => 'activity_type',
        'name' => array('IN' => $activityTypes),
        'api.OptionValue.setvalue' => array(
          'field' => 'grouping',
          'value' => $grouping,
        ),
      ));
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
      'grouping' => 'system',
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
      'Scheduled' => 'none,task,file,communication,milestone,system',
      'Completed' => 'none,task,file,communication,milestone,alert,system',
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
        'return' => 'id',
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

    $this->createManageCasesMenuItem();
  }

  /**
   * Creates 'Manage Cases' menu item for Cases navigation.
   */
  private function createManageCasesMenuItem() {
    $this->addNav(array(
      'label' => ts('Manage Cases', array('domain' => 'org.civicrm.civicase')),
      'name' => 'Manage Cases',
      'url' => 'civicrm/case/a/#/case/list',
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

    $this->removeNav('Manage Cases');
  }

  /**
   * Fixes original id of followup activities to point to the original activity and not a revision.
   *
   * TODO: This is a WIP (untested) and not yet called from anywhere.
   * When it's ready we can change its name to upgrade_000X and call it from the installer
   */
  public function fixActivityRevisions() {
    $sql = 'UPDATE civicrm_activity a, civicrm_activity b
      SET a.parent_id = b.original_id
      WHERE a.parent_id = b.id
      AND b.original_id IS NOT NULL';
    CRM_Core_DAO::executeQuery($sql);
    // TODO: before we uncomment the below, need to migrate this history to advanced logging table
    // CRM_Core_DAO::executeQuery('DELETE FROM civicrm_activity WHERE original_id IS NOT NULL');
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
  protected function toggleNav($name, $isActive) {
    CRM_Core_DAO::executeQuery("UPDATE `civicrm_navigation` SET is_active = %2 WHERE name IN (%1)", array(
      1 => array($name, 'String'),
      2 => array($isActive ? 1 : 0, 'Int'),
    ));
  }

  /**
   * @param string $name
   *   The name of the item in `civicrm_navigation`.
   */
  protected function removeNav($name) {
    CRM_Core_DAO::executeQuery("DELETE FROM `civicrm_navigation` WHERE name IN (%1)", array(
      1 => array($name, 'String'),
    ));
  }

  /**
   * Re-enable the extension's parts.
   */
  public function enable() {
    $this->swapCaseMenuItems();

    $this->toggleNav('Manage Cases', TRUE);
  }

  /**
   * Disable the extension's parts without removing them.
   */
  public function disable() {
    $this->swapCaseMenuItems();

    $this->toggleNav('Manage Cases', FALSE);
  }

  /**
   * Swaps weight and has_separator values between 'Find Cases'
   * and 'Manage Cases' menu items.
   */
  private function swapCaseMenuItems() {
    $findCasesMenuItem = $this->getCaseMenuItem('Find Cases');
    $manageCasesMenuItem = $this->getCaseMenuItem('Manage Cases');

    if (!$findCasesMenuItem || !$manageCasesMenuItem) {
      return TRUE;
    }

    // Updating 'Find Cases' menu item.
    civicrm_api3('Navigation', 'create', array(
      'id' => $findCasesMenuItem['id'],
      'weight' => !empty($manageCasesMenuItem['weight']) ? $manageCasesMenuItem['weight'] : NULL,
      'has_separator' => $manageCasesMenuItem['has_separator'],
    ));

    // Updating 'Manage Cases' menu item.
    civicrm_api3('Navigation', 'create', array(
      'id' => $manageCasesMenuItem['id'],
      'weight' => !empty($findCasesMenuItem['weight']) ? $findCasesMenuItem['weight'] : NULL,
      'has_separator' => $findCasesMenuItem['has_separator'],
    ));

    CRM_Core_BAO_Navigation::resetNavigation();
  }

  /**
   * Returns an array containing Case menu item for specified name.
   * Returns NULL if menu item is not found.
   *
   * @param string $name
   *
   * @return array|NULL
   */
  private function getCaseMenuItem($name) {
    $result = civicrm_api3('Navigation', 'get', array(
      'sequential' => 1,
      'parent_id' => 'Cases',
      'name' => $name,
      'options' => array('limit' => 1),
    ));

    if (empty($result['id'])) {
      return NULL;
    }

    return $result['values'][0];
  }

  /**
   * Creates custom group for case stats and custom field to hold case duration.
   *
   * @return bool
   */
  public function upgrade_1001() {
    $customGroup = $this->createStatsCustomGroup();
    $durationField = $this->createDurationCustomField($customGroup);
    $this->createCaseDurationLogTable();
    $this->buildDurationLog();
    $this->calculateCasesDuration($customGroup, $durationField);
    $this->createCaseDurationScheduledJob();

    return false;
  }

  /**
   * Creates scheduled job that maintains cases' durations updated.
   */
  private function createCaseDurationScheduledJob() {
    $dao = new CRM_Core_DAO_Job();
    $dao->api_entity = 'case';
    $dao->api_action = 'calculatealldurations';
    $dao->find(TRUE);

    if (!$dao->id) {
      $dao = new CRM_Core_DAO_Job();
      $dao->domain_id = CRM_Core_Config::domainID();
      $dao->run_frequency = 'Daily';
      $dao->parameters = null;
      $dao->name = 'Case Duration Calculation';
      $dao->description = 'Job to update the duration of cases.';
      $dao->api_entity = 'case';
      $dao->api_action = 'calculatealldurations';
      $dao->is_active = 1;
      $dao->save();
    }
  }

  /**
   * Calculates duration for all cases and stores it in the corresponding field.
   *
   * @param $statsGroup
   * @param $durationField
   */
  private function calculateCasesDuration($statsGroup, $durationField) {
    CRM_Core_DAO::executeQuery('TRUNCATE TABLE ' . $statsGroup['table_name']);
    CRM_Core_DAO::executeQuery("
      INSERT INTO {$statsGroup['table_name']} (entity_id, {$durationField['column_name']})
        SELECT case_id, SUM(CASE WHEN duration IS NULL THEN datediff(CURDATE(), start_date) ELSE duration END) AS duration 
        FROM civicrm_case_duration_log 
        GROUP BY case_id
    ");
  }

  /**
   * Inserts records into case duration log table by processing all cases'
   * history.
   */
  private function buildDurationLog() {
    CRM_Core_DAO::executeQuery('TRUNCATE TABLE civicrm_case_duration_log');

    $query = "
      SELECT civicrm_case_activity.case_id, civicrm_activity.*
      FROM civicrm_case, civicrm_case_activity, civicrm_activity, 
        civicrm_option_group og_activity_type, 
        civicrm_option_value ov_activity_type 
      WHERE civicrm_case.id = civicrm_case_activity.case_id
      AND civicrm_case_activity.activity_id = civicrm_activity.id
      AND og_activity_type.name = 'activity_type'
      AND og_activity_type.id = ov_activity_type.option_group_id
      AND ov_activity_type.value = civicrm_activity.activity_type_id
      AND ov_activity_type.name IN ('Open Case', 'Change Case Status')
      ORDER BY civicrm_case.id ASC, civicrm_activity.activity_date_time
    ";
    $caseActivitiesResult = CRM_Core_DAO::executeQuery($query);

    $logger = new CRM_Civicase_CaseDurationLog();
    while ($caseActivitiesResult->fetch()) {
      $logger->processOldCaseActivity($caseActivitiesResult);
    }
  }

  /**
   * Creates case duration log table.
   */
  private function createCaseDurationLogTable() {
    CRM_Core_DAO::executeQuery("
      CREATE TABLE IF NOT EXISTS `civicrm_case_duration_log` (
        `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key.',
        `case_id` int(10) UNSIGNED NOT NULL COMMENT 'Case ID for which the record is set.',
        `start_task` int(10) UNSIGNED NOT NULL COMMENT 'Task that signaled the case''s start.',
        `start_date` date NOT NULL COMMENT 'Date on which the case started.',
        `end_task` int(10) UNSIGNED DEFAULT NULL COMMENT 'Task on which the case ended.',
        `end_date` date DEFAULT NULL COMMENT 'Date on which the case ended.',
        `duration` int(11) DEFAULT NULL COMMENT 'Case''s duration, in days.',
        
        PRIMARY KEY (`id`),
        KEY `case_id` (`case_id`),
        KEY `fk_start_task` (`start_task`),
        KEY `fk_end_task` (`end_task`),
        
        CONSTRAINT `fk_end_task` FOREIGN KEY (`end_task`) REFERENCES `civicrm_activity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT `fk_case` FOREIGN KEY (`case_id`) REFERENCES `civicrm_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT `fk_start_task` FOREIGN KEY (`start_task`) REFERENCES `civicrm_activity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE    
      ) ENGINE=InnoDB;
    ");
  }

  /**
   * Creates a custom group for cases to put case stats.
   *
   * @return array
   *   Data for the created/obtained custom group.
   */
  private function createStatsCustomGroup() {
    $customGroupResult = civicrm_api3('CustomGroup', 'get', array(
      'sequential' => 1,
      'name' => 'Case_Stats'
    ));

    if ($customGroupResult['count'] < 1) {
      $customGroupResult = civicrm_api3('CustomGroup', 'create', array(
        'sequential' => 1,
        'title' => 'Case Stats',
        'name' => 'Case_Stats',
        'extends' => 'Case',
        'weight' => 10,
        'collapse_display' => 0,
        'style' => 'Inline',
        'is_active' => 1
      ));
    }

    return array_shift($customGroupResult['values']);
  }

  /**
   * Create duration custom field on given custom group.
   *
   * @param array $customGroup
   *   Data of the custom group where the field should be created
   */
  private function createDurationCustomField($customGroup) {
    $fieldResult = civicrm_api3('CustomField', 'get', array(
      'sequential' => 1,
      'custom_group_id' => $customGroup['id'],
      'name' => 'duration',
    ));

    if ($fieldResult['count'] < 1) {
      $fieldResult = civicrm_api3('CustomField', 'create', array(
        'custom_group_id' => $customGroup['id'],
        'name' => 'duration',
        'label' => 'Duration (days)',
        'html_type' => 'Text',
        'data_type' => 'Int',
        'weight' => 1,
        'is_required' => 0,
        'is_searchable' => 1,
        'is_active' => 1,
        'is_view' => 1,
        'is_search_range' => 1,
      ));
    }

    return array_shift($fieldResult['values']);
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
