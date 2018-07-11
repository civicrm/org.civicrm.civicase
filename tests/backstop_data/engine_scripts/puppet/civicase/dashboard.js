'use strict';

module.exports = async (engine, scenario, vp) => {
  await engine.waitForSelector('.dataTables_wrapper .crm-entity', { visible: true });
};
