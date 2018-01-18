<?php

/**
 * API call to calculate the duration of all cases.
 */
function civicrm_api3_case_calculatealldurations() {
  $logger = new CRM_Civicase_CaseDurationLog();
  $logger->calculateAllCasesDuration();

  return array();
}