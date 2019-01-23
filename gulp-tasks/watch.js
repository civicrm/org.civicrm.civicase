/**
 * @file
 * This file contains function for watch gulp task
 */

'use strict';

var gulp = require('gulp');
var civicrmScssRoot = require('civicrm-scssroot')();

module.exports = function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch(['ang/**/*.js', '!ang/test/karma.conf.js'], ['test']);
  gulp.watch(civicrmScssRoot.getWatchList(), ['sass']);
};
