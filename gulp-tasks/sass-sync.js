/**
 * @file
 * This file contains function for sass:sync gulp task
 */

'use strict';

var civicrmScssRoot = require('civicrm-scssroot')();

module.exports = function () {
  civicrmScssRoot.updateSync();
};
