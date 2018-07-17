'use strict';

module.exports = async (engine, scenario, viewport) => {
  await require('./main')(engine, scenario, viewport);

  await engine.click('a[href="#acttab-actType"]');
  // wait for fadein animation to complete.
  await engine.waitFor(() => {
    const uiBlock = document.querySelector('#acttab-actType');

    return uiBlock.style.display === 'block';
  });
};
