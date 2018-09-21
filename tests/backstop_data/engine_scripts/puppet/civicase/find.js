'use strict';

module.exports = async (engine, scenario, vp) => {
  await Promise.all([
    engine.click('a[name="find_my_cases"]'),
    engine.waitForNavigation()
  ]);
};
