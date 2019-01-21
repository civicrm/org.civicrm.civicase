'use strict';

module.exports = class CrmPage {
  constructor (engine, scenario, viewPort) {
    this.engine = engine;
    this.scenario = scenario;
    this.viewPort = viewPort;
  }

  /**
   * Waits for the selector to be clearly visible on the screen.
   *
   * @param {String} selector - the css selector of the target elements to
   * look for.
   */
  async waitForVisibility (selector) {
    await this.engine.waitFor((selector) => {
      const uiBlock = document.querySelector(selector);

      return uiBlock.style.display === 'block';
    }, {}, selector);
  }
};
