'use strict';

module.exports = async (page, scenario, vp) => {
  console.log('--------------------------------------------');
  console.log('Running Scenario "' + scenario.label + '" ' + scenario.count);

  await require('./clickAndHoverHelper')(page, scenario);
  await require('./loadCookies')(page, scenario);
};
