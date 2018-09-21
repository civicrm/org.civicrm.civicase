'use strict';

module.exports = async (engine, scenario, vp) => {
  await engine.waitFor('.cke .cke_contents', { visible: true });
};
