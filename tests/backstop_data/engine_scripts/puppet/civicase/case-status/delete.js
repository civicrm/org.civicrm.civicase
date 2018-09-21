'use strict';

module.exports = async (engine, scenario, viewport) => {
  await engine.click('a[title="Delete case_status Type"]');
  await engine.waitFor('.modal-dialog > form', { visible: true });
  // wait for readjustment of modal window
  await engine.waitFor(200);
};
