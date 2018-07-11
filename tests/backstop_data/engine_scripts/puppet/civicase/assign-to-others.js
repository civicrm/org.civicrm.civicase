'use strict';

module.exports = async (engine, scenario, vp) => {
  await require('./find.js')(engine, scenario, vp);
  await engine.click('a[title="Assign to Another Client"]');
  await engine.waitFor('.modal-dialog > form');
  await engine.waitFor(500);
};
