'use strict';

module.exports = async (engine, scenario, vp) => {
  await require('./find.js')(engine, scenario, vp);
  await Promise.all([
    engine.click('a[title="Manage Case"]'),
    engine.waitForNavigation()
  ]);
  await engine.evaluate(selector => {
    document.querySelectorAll(selector).forEach(element => element.click());
  }, 'div.crm-accordion-wrapper.collapsed > div');
  try {
    await this.engine.waitFor('.blockUI.blockOverlay', { hidden: true });
    await this.engine.waitFor('.loading-text', { hidden: true, timeout: 8000 });
    await this.engine.waitFor('[alt="loading"]', { hidden: true });
    // wait for reedjustment of the modal after ajax content load after opening accordion
    await this.engine.waitFor(500);
    console.log('All accordion blocks loaded');
  } catch (e) {
    console.log('Loaders still visible and timeout reached!');
  }  
};
