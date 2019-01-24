'use strict';

const Utility = require('./utility.js');
const mouseEventsHelper = require('./mouse-events-helper');

module.exports = async (page, scenario, vp) => {
  const utility = new Utility(page, scenario, vp);

  await utility.waitForAngular();
  await utility.waitForLoadingComplete();

  await mouseEventsHelper(page, scenario);
};
