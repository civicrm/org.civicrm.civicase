/**
 * @file
 * Contains gulp tasks for the application
 *
 * Available Tasks
 * default
 * sass:sync
 * sass
 * test
 * backstopjs
 * backstopjs
 * backstopjs
 * backstopjs
 * watch
 */

'use strict';

var gulp = require('gulp');

var backstopJSTask = require('./gulp-tasks/backstopjs.js');
var sassTask = require('./gulp-tasks/sass.js');
var sassSyncTask = require('./gulp-tasks/sass-sync.js');
var testTask = require('./gulp-tasks/karma-unit-test.js');
var watchTask = require('./gulp-tasks/watch.js');

/**
 * Updates and sync the scssRoot paths
 */
gulp.task('sass:sync', sassSyncTask);

/**
 * Compiles civicase.scss under scss folder to CSS counterpart
 */
gulp.task('sass', ['sass:sync'], sassTask);

/**
 * Runs Karma unit tests
 */
gulp.task('test', testTask);

/**
 * Watches for scss and js file changes and run sass task and karma unit tests
 */
gulp.task('watch', watchTask);

/**
 * BackstopJS task
 *
 * backstopjs:reference: Creates reference screenshots
 * backstopjs:test: Creates test screenshots and matching them
 * backstopjs:openReport: Opens reports in the browser
 * backstopjs:approve: Approves reports
 */
['reference', 'test', 'openReport', 'approve'].map(backstopJSTask);

/**
 * Runs sass and test task
 */
gulp.task('default', ['sass', 'test']);
