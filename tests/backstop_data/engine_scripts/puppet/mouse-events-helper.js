'use strict';

const Utility = require('./utility.js');

module.exports = async (page, scenario, vp) => {
  const hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  const clickSelector = scenario.clickSelectors || scenario.clickSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]
  const utility = new Utility(page, scenario, vp);

  if (hoverSelector) {
    for (const hoverSelectorIndex of [].concat(hoverSelector)) {
      await page.waitFor(hoverSelectorIndex);
      await page.hover(hoverSelectorIndex);

      if (scenario.waitForAjaxComplete) {
        await utility.waitForLoadingComplete();
      }
    }
  }

  if (clickSelector) {
    for (const clickSelectorIndex of [].concat(clickSelector)) {
      await page.waitFor(clickSelectorIndex);
      await page.click(clickSelectorIndex);

      if (scenario.waitForAjaxComplete) {
        await utility.waitForLoadingComplete();
      }
    }
  }

  if (postInteractionWait) {
    await page.waitFor(postInteractionWait);
  }
};
