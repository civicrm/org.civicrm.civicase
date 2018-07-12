'use strict';

module.exports = async (engine, scenario, vp) => {
  await require('./find.js')(engine, scenario, vp);
  await engine.goto(await buildUrl.call(this, engine, 'a[title="Manage Case"]'), {'waitUntil': 'networkidle0'});
  // open all accordions
  await engine.evaluate(selector => {
    document.querySelectorAll(selector).forEach(element => element.click());
  }, 'div.crm-accordion-wrapper.collapsed > div');
};

/**
  * Builds full absolute url for the new page to be navigated to
  *
  * @param {Object} engine - engine object of puppeter
  * @param {String} selector - <a> tag selector to be clicked on for navigation
  *
  * @return {String} - Full absolute url for Manage cases page
  */
async function buildUrl (engine, selector) {
  const urlRegex = /^(.*:)\/\/([A-Za-z0-9\-.]+)(:[0-9]+)?(.*)$/g;
  const urlElements = urlRegex.exec(engine.url());
  const relativeUrl = await engine.evaluate((selector) => {
    return document.querySelector(selector).getAttribute('href');
  }, selector);

  return urlElements[1] + '//' + urlElements[2] + (urlElements[3] !== undefined ? urlElements[3] : '') + relativeUrl;
}
