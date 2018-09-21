'use strict';

const Utility = require('../../utility.js');

module.exports = async (engine, scenario, viewport) => {
  const utility = new Utility(engine, scenario, viewport);
  
  await require('./main')(engine, scenario, viewport);
  await engine.click('a[href="#acttab-statuses"]');
  await utility.waitForVisibility('#acttab-statuses');
};
