<?php

return [
  'civicaseAllowCaseLocks' => [
    'group_name' => 'CiviCRM Preferences',
    'group' => 'core',
    'name' => 'civicaseAllowCaseLocks',
    'type' => 'Boolean',
    'quick_form_type' => 'YesNo',
    'default' => FALSE,
    'html_type' => 'radio',
    'add' => '4.7',
    'title' => 'Allow cases to be locked',
    'is_domain' => 1,
    'is_contact' => 0,
    'description' => 'This will allow cases to be locked for certain contacts.',
    'help_text' => '',
  ],
];
