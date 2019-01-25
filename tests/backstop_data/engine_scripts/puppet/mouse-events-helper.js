'use strict';

const Utility = require('./utility.js');

module.exports = async (page, scenario, viewport) => {
  const actions = [
    { name: 'hoverSelector', execute: hoverSelectorAction },
    { name: 'hoverSelectors', execute: hoverSelectorAction },
    { name: 'clickSelector', execute: clickSelectorAction },
    { name: 'clickSelectors', execute: clickSelectorAction }
  ];

  for (const action of actions) {
    const scenarioHasAction = !!scenario[action.name];

    scenarioHasAction && await action.execute(page, scenario, viewport);
  }
};

/**
 * Action handler for hover event
 *
 * @param {Object} page pupettter engine object
 * @param {Object} scenario object of each scenario
 * @param {Object} viewport viewport configurations
 */
async function hoverSelectorAction (page, scenario, viewport) {
  const hoverSelectors = scenario.hoverSelectors || [ scenario.hoverSelector ];
  const utility = new Utility(page, scenario, viewport);

  for (const hoverSelector of hoverSelectors) {
    await utility.waitForAndHover(clickSelectorIndex);

    if (scenario.waitForAjaxComplete) {
      await utility.waitForLoadingComplete();
    }
  }
}

/**
 * Action handler for click event
 *
 * @param {Object} page pupettter engine object
 * @param {Object} scenario object of each scenario
 * @param {Object} viewport viewport configurations
 */
async function clickSelectorAction (page, scenario, viewport) {
  const clickSelectors = scenario.clickSelectors || [ scenario.clickSelector ];
  const utility = new Utility(page, scenario, viewport);

  for (const clickSelector of clickSelectors) {
    await utility.waitForAndClick(clickSelectorIndex);

    if (scenario.waitForAjaxComplete) {
      await utility.waitForLoadingComplete();
    }
  }
}
