<?php

use Civi\Test\HeadlessInterface;
use Civi\Test\HookInterface;
use Civi\Test\TransactionalInterface;

/**
 * Activity.Getmonthswithactivities API Test Case
 * This is a generic test class implemented with PHPUnit.
 * @group headless
 */
class api_v3_Activity_GetmonthswithactivitiesTest extends BaseHeadlessTest {

  /**
   * Test function to return expected data model.
   */
  public function testApiExample() {
    $result = civicrm_api3('Activity', 'Getmonthswithactivities')['values'];
    $this->assetInternalType('array', $result);

    $first = $result[0];
    $this->assertArrayHasKey('year', $first);
    $this->assertArrayHasKey('month', $first);
    $this->assertEquals('Twelve', $result['values'][12]['name']);
  }

}
