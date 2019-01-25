'use strict';

const Utility = require('./../utility.js');

module.exports = async (page, scenario, vp) => {
  const utility = new Utility(page, scenario, vp);
  const viewPortOverride = Object.assign(page.viewport(), {height: 800});

  await page.setViewport(viewPortOverride);

  await require('./activity-detail.js')(page, scenario, vp);
  await page.click('.civicase__activity-feed__body__details .edit.button');
  await page.waitFor('.blockUI.blockOverlay', { hidden: true });
  await utility.openAllAccordions();
};
