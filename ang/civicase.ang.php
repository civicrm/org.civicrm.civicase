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
return array (
  'js' => 
  array (
    0 => 'ang/civicase.js',
    1 => 'ang/civicase/*.js',
    2 => 'ang/civicase/*/*.js',
  ),
  'css' => 
  array (
    0 => 'ang/activityFeed.css',
  ),
  'partials' => 
  array (
    0 => 'ang/civicase',
  ),
  'settings' => 
  array (
  ),
);