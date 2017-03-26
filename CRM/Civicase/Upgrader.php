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
    // Create Alert activity type
    $this->createActivityType(array(
      'option_group_id' => 'activity_type',
      'label' => ts('Alert'),
      'name' => 'Alert',
      'grouping' => 'alert',
      'is_reserved' => 0,
      'description' => ts('Alerts to display in cases'),
      'component_id' => 'CiviCase',
      'icon' => 'fa-exclamation',
    ));
    $this->createActivityType(array(
      'option_group_id' => 'activity_type',
      'label' => ts('File Upload'),
      'name' => 'File Upload',
      // 'grouping' => '',
      'is_reserved' => 0,
      'description' => ts('Add files to a case'),
      'component_id' => 'CiviCase',
      'icon' => 'fa-file',
    ));
    // Set status colors
    $colors = array(
      'Scheduled' => '#42afcb',
      'Completed' => '#8ec68a',
      'Left Message' => '#eca67f',
      'Available' => '#5bc0de',
    );
    foreach ($colors as $name => $color) {
      civicrm_api3('OptionValue', 'get', array(
        'option_group_id' => 'activity_status',
        'name' => $name,
        'api.OptionValue.setvalue' => array('field' => 'color', 'value' => $color),
      ));
    }
  }

  /**
   * Tasks to perform after the module is installed.
   */
  public function postInstall() {
  }

  /**
   * Example: Run an external SQL script when the module is uninstalled.
   */
  public function uninstall() {
    try {
      civicrm_api3('OptionValue', 'get', array(
        'return' => array('id'),
        'option_group_id' => 'activity_category',
        'options' => array('limit' => 0),
        'api.OptionValue.delete' => array(),
      ));
    } catch (Exception $e) {
    }
    try {
      civicrm_api3('OptionGroup', 'get', array(
        'return' => array('id'),
        'name' => 'activity_category',
        'api.OptionGroup.delete' => array(),
      ));
    } catch (Exception $e) {
    }
    // Delete alert activity type if unused
    try {
      $alerts = civicrm_api3('Activity', 'getcount', array(
        'activity_type_id' => 'Alert',
      ));
      if (empty($alerts['result'])) {
        civicrm_api3('OptionValue', 'get', array(
          'return' => array('id'),
          'option_group_id' => 'activity_type',
          'name' => 'Alert',
          'api.OptionValue.delete' => array(),
        ));
      }
    } catch (Exception $e) {
    }
  }

  /**
   * @param $params
   */
  protected function createActivityType($params) {
    $existing = civicrm_api3('OptionValue', 'get', array(
      'option_group_id' => 'activity_type',
      'name' => $params['name'],
      'return' => 'id',
      'options' => array('limit' => 1),
    ));
    if (!empty($existing['id'])) {
      $params['id'] = $existing['id'];
    }
    else {
      $sql = "SELECT MAX(ROUND(value)) + 1 FROM civicrm_option_value WHERE option_group_id = (SELECT id FROM civicrm_option_group WHERE name = 'activity_type')";
      $params['value'] = CRM_Core_DAO::singleValueQuery($sql);
      $sql = "SELECT MAX(ROUND(weight)) + 1 FROM civicrm_option_value WHERE option_group_id = (SELECT id FROM civicrm_option_group WHERE name = 'activity_type')";
      $params['weight'] = CRM_Core_DAO::singleValueQuery($sql);
    }
    civicrm_api3('OptionValue', 'create', $params);
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
   * Example: Run an external SQL script.
   *
   * @return TRUE on success
   * @throws Exception
  public function upgrade_4201() {
    $this->ctx->log->info('Applying update 4201');
    // this path is relative to the extension base dir
    $this->executeSqlFile('sql/upgrade_4201.sql');
    return TRUE;
  } // */

  public function upgrade_4700() {
    $this->ctx->log->info('Applying update 4700');
    $this->createActivityType(array(
      'option_group_id' => 'activity_type',
      'label' => ts('File Upload'),
      'name' => 'File Upload',
      // 'grouping' => '',
      'is_reserved' => 0,
      'description' => ts('Add files to a case'),
      'component_id' => 'CiviCase',
      'icon' => 'fa-file',
    ));
    return TRUE;
  }

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
