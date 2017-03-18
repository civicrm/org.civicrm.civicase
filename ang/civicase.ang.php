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
return array(
  'js' => array(
    'ang/civicase.js',
    'ang/civicase/*.js',
    'ang/civicase/*/*.js',
  ),
  'css' => array(
    'ang/*.css',
  ),
  'partials' => array(
    'ang/civicase',
  ),
  'settings' => array(),
);