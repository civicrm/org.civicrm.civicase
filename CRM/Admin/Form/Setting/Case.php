<?php

/**
 * This class generates form components for CiviCase.
 */
class CRM_Admin_Form_Setting_Case extends CRM_Admin_Form_Setting {

  protected $_settings = array(
    'civicaseRedactActivityEmail' => CRM_Core_BAO_Setting::SYSTEM_PREFERENCES_NAME,
    'civicaseAllowMultipleClients' => CRM_Core_BAO_Setting::SYSTEM_PREFERENCES_NAME,
    'civicaseNaturalActivityTypeSort' => CRM_Core_BAO_Setting::SYSTEM_PREFERENCES_NAME,
    'civicaseActivityRevisions' => CRM_Core_BAO_Setting::SYSTEM_PREFERENCES_NAME,
    'civicaseAllowCaseLocks' => CRM_Core_BAO_Setting::SYSTEM_PREFERENCES_NAME,
  );

  /**
   * Build the form object.
   */
  public function buildQuickForm() {
    CRM_Utils_System::setTitle(ts('Settings - CiviCase'));
    parent::buildQuickForm();
  }

}
