'use strict';

const loadCookies = require('./load-cookies');

module.exports = async (page, scenario, vp) => {
  console.log('--------------------------------------------');
  console.log('Running Scenario "' + scenario.label + '" ' + scenario.count);

  await loadCookies(page, scenario);
};
