'use strict';

const Utility = require('./../utility.js');

module.exports = async (page, scenario, vp) => {
  const utility = new Utility(page, scenario, vp);

  await page.type('#sort_name', 'Betty Adams');
  await utility.clickAndWaitForNavigation('#_qf_Basic_refresh');
  await utility.clickAndWaitForNavigation('.crm-search-results a[title="View Contact Details"]');
};
