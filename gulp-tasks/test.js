/**
 * @file
 * This file contains function for karma tests gulp task
 */

'use strict';

var karma = require('karma');
var path = require('path');

module.exports = function (done) {
  new karma.Server({
    configFile: path.resolve(__dirname, '../ang/test/karma.conf.js'),
    singleRun: true
  }, done).start();
};
