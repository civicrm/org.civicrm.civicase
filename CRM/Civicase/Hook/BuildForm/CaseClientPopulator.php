<?php

class CRM_Civicase_Hook_BuildForm_CaseClientPopulator {

  /**
   * Runs the Case Client populator hook for the Case Form. When a client id
   * is provided as a request parameter, it adds this value to the client id
   * field of the form.
   *
   * @param CRM_Core_Form $form
   */
  public function run(&$form) {
    $clientId = CRM_Utils_Request::retrieve('civicase_cid', 'Positive');

    if (!$this->shouldRun($form, $clientId)) {
      return;
    }

    $form->setDefaults(['client_id' => $clientId]);
  }

  /**
   * Determines if the hook will run. This hook is only valid for the Case form
   * and the civicase client id parameter must be defined.
   *
   * @param CRM_Core_Form $form
   * @param INT|NULL $clientId
   */
  public function shouldRun($form, $clientId) {
    $isCaseForm = CRM_Case_Form_Case::class === get_class($form);

    return $isCaseForm && $clientId;
  }

}
