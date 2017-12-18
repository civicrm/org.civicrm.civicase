<?php

/**
 * Obtains list of columns that can be viewed on case lists.
 *
 * @param array $params
 *   Parameters for the call.
 *
 * @return array
 *   List of headers.
 */
function civicrm_api3_case_getcaselistheaders($params) {
  return CRM_Civicase_Utils_Caselist::getAllowedHeaders();
}
