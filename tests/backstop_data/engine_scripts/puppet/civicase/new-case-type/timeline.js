'use strict';

const Utility = require('../../utility.js');

module.exports = async (engine, scenario, viewport) => {
  const utility = new Utility(engine, scenario, viewport);
  
  await require('./main')(engine, scenario, viewport);
  await engine.click('a[href="#acttab-0"]');
  await utility.waitForVisibility('#acttab-0');
};
