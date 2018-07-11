'use strict';

module.exports = async (engine, scenario, vp) => {
  const isWysiwygVisible = await engine.evaluate((selector) => {
    const e = document.querySelector(selector);

    if (!e) {
      return false;
    }

    const style = window.getComputedStyle(e);

    return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && e.offsetHeight > 0;
  }, '.crm-form-wysiwyg');

  if (isWysiwygVisible) {
    await engine.waitFor('.cke .cke_contents', { visible: true });
  }
};
