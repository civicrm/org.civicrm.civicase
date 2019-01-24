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

  /**
   * Waits for Angular to load by checking #bootstrap-theme element
   */
  async waitForAngular () {
    await this.engine.waitForSelector('#bootstrap-theme');
  }

  /**
   * Waits for all the loading placeholders to vanish
   */
  async waitForLoadingComplete () {
    await this.engine.waitFor(() => {
      const allLoadingElements = document.querySelectorAll('div[class*="civicase__loading-placeholder"]');

      return allLoadingElements.length === 0;
    });
  }

  /**
   * Clones UIB Popover popup DOM node
   */
  async cloneUibPopover () {
    await this.engine.evaluate(() => {
      let uibPopover = document.querySelector('div[uib-popover-popup]');
      const uibPopoverClone = uibPopover.cloneNode(true);

      // Insert the new node before the reference node
      uibPopover.parentNode.insertBefore(uibPopoverClone, uibPopover.nextSibling);
    });
  }
};
