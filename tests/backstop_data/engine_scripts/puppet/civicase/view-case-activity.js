'use strict';

module.exports = async (engine, scenario, vp) => {
  await require('./dashboard.js')(engine, scenario, vp);
  await engine.click('a[title="Activities"]');
  await engine.waitFor('.crm-child-row', { visible: true });
  await engine.waitFor('.blockUI.blockOverlay', { hidden: true });
};
