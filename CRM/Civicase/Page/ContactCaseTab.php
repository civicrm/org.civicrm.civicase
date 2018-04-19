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
    $relatedCases = CRM_Utils_Request::retrieve('relatedCases', 'Boolean');
    if($relatedCases) {
      $rcases = new CRM_Civicase_RelatedCases();
      $related_cids = implode(',', $rcases->getOrganizationRelatedCaseContactIds($cid));
      $this->assign('related_cids', $related_cids);
    }
    parent::run();
  }

}
