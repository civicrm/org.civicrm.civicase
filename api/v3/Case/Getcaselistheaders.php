<?php

function civicrm_api3_case_getcaselistheaders($params) {
  return CRM_Civicase_Utils_Caselist::getAllowedHeaders();
}
