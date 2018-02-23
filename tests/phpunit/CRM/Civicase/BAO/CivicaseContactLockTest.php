<?php
use Civi\Test\HeadlessInterface;
use Civi\Test\TransactionalInterface;
use CRM_Civicase_Test_Fabricator_Case as CaseFabricator;
use CRM_Civicase_Test_Fabricator_CaseType as CaseTypeFabricator;
use CRM_Civicase_Test_Fabricator_Contact as ContactFabricator;

/**
 * Runs tests on CivicaseContactLock BAO.
 *
 * @group headless
 */
class CRM_Civicase_BAO_CivicaseContactLockTest extends PHPUnit_Framework_TestCase
  implements HeadlessInterface, TransactionalInterface {

  /**
   * @inheritdoc
   */
  public function setUpHeadless() {
    return \Civi\Test::headless()
      ->installMe(__DIR__)
      ->apply();
  }

  /**
   * Tests creation of a several locks for more than one contact and more than
   * one case.
   */
  public function testCreateLocks() {
    $cases = $contacts = array();
    $caseType = CaseTypeFabricator::fabricate();

    for ($i = 0; $i < 3; $i++) {
      $case = CaseFabricator::fabricate(array('case_type_id' => $caseType['id']));
      $contact = ContactFabricator::fabricate();

      $cases[] = $case['id'];
      $contacts[] = $contact['id'];
    }

    CRM_Civicase_BAO_CivicaseContactLock::createLocks($cases, $contacts);

    foreach ($cases as $currentCase) {
      $result = civicrm_api3('CivicaseContactLock', 'get', array(
        'sequential' => 1,
        'case_id' => $currentCase,
      ));
      $this->assertEquals($result['count'], sizeof($contacts));

      foreach ($result['values'] as $currentLock) {
        $this->assertEquals($currentLock['case_id'], $currentCase);
        $this->assertContains($currentLock['contact_id'], $contacts);
      }
    }
  }

  /**
   * Tests an exception is thrown if one if either of the parameters passed to
   * createLocks method of BAO is not an array.
   *
   * @expectedException API_Exception
   */
  public function testExceptionThrownOnNonInputParametersToCreateLocks() {
    CRM_Civicase_BAO_CivicaseContactLock::createLocks(1, 2);
  }

}
