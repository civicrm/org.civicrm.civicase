<?php

function _civicrm_api3_relationship_type_getcaseroles_spec(&$spec) {
  // no specs
}

function civicrm_api3_relationship_type_getcaseroles($params) {
  $rolesMap = [];
  $caseTypes = civicrm_api3('CaseType', 'get', [
    'sequential' => 1,
    'is_active' => 1,
  ]);

  foreach ($caseTypes['values'] as $caseType) {
    foreach ($caseType['definition']['caseRoles'] as $role) {
      $rolesMap[$role['name']] = true;
    }
  }

  $relationshipTypes = civicrm_api3('RelationshipType', 'get', [
    'label_b_a' => ['IN' => array_keys($rolesMap)],
    'is_active' => 1,
  ]);

  return $relationshipTypes;
}
