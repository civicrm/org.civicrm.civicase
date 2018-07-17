'use strict';

module.exports = async (engine, scenario, vp) => {
  await require('./find.js')(engine, scenario, vp);
  await Promise.all([
    engine.click('a[title="Manage Case"]'),
    engine.waitForNavigation()
  ]);
  // open all accordions
  await engine.evaluate(selector => {
    document.querySelectorAll(selector).forEach(element => element.click());
  }, 'div.crm-accordion-wrapper.collapsed > div');
  await engine.waitFor(() => {
    const tables = document.querySelectorAll('.dataTables_processing');

    return tables.length > 0 && Array.from(tables).every(table => table.style.display === 'none');
  });
  await engine.waitForSelector('.fa-calendar');
};
