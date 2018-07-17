'use strict';

module.exports = async (engine, scenario, viewport) => {
  await require('./main')(engine, scenario, viewport);

  await engine.click('a[href="#acttab-statuses"]');
  // wait for fadein animation to complete.
  await engine.waitFor(() => {
    const uiBlock = document.querySelector('#acttab-statuses');

    return uiBlock.style.display === 'block';
  });
};
