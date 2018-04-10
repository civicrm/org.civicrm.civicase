<?php

/**
 * Class CRM_Civicase_Page_ContactActivityTab
 *
 * Implement the Angular version of the tab "View Contact => Cases".
 */
class CRM_Civicase_Page_ContactCaseTab extends CRM_Core_Page {

  public function run() {
    $cid = CRM_Utils_Request::retrieve('cid', 'Positive', CRM_Core_DAO::$_nullObject, TRUE);
    $this->assign('cid', $cid);
    // For Related cases tab (optional)
    $related_cids = CRM_Utils_Request::retrieve('related_cids', 'String');
    if($related_cids)
      $this->assign('related_cids', $related_cids);
    parent::run();
  }

}
