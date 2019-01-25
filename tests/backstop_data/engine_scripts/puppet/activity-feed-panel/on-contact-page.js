'use strict';

const Utility = require('./../utility.js');

module.exports = async (page, scenario, vp) => {
  const utility = new Utility(page, scenario, vp);

  await require('./../contacts/contact-dashboard.js')(page, scenario, vp);

  await page.click('.ui-tabs-anchor[title="Activities"]');
  await page.waitFor('.blockUI.blockOverlay', { hidden: true });
  await page.waitForSelector('#civicaseActivitiesTab #bootstrap-theme .civicase__activity-feed');
  await utility.waitForLoadingComplete();
};
