'use strict';

const Utility = require('./../utility.js');

module.exports = async (page, scenario, vp) => {
  const utility = new Utility(page, scenario, vp);

  await utility.waitForAngular();
  await utility.waitForLoadingComplete();
  await page.click('.civicase__bulkactions-checkbox-toggle');
  // this waits for the animation to finish before continue:
  await page.waitFor(300);
  await page.click('.civicase__checkbox--bulk-action');
};
