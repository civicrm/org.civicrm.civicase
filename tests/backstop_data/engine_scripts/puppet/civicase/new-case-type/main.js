'use strict';

module.exports = async (engine, scenario, viewport) => {
  await engine.waitFor('form[name="editCaseTypeForm"]');
};
