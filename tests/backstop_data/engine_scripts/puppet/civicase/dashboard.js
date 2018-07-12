'use strict';

module.exports = async (engine, scenario, vp) => {
  await engine.waitFor(() => {
    const tables = document.querySelectorAll('.dataTables_processing');

    return tables.length > 0 && Array.from(tables).every(table => table.style.display === 'none');
  });
};
