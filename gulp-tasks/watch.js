/**
 * @file
 * Exports Gulp "watch" task
 */

'use strict';

var gulp = require('gulp');
var civicrmScssRoot = require('civicrm-scssroot')();

module.exports = function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch(civicrmScssRoot.getWatchList(), ['sass']);
  gulp.watch(['ang/**/*.js', '!ang/test/karma.conf.js'], ['test']);
};
