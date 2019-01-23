/**
 * @file
 * This file contains gulp configurations for setting up SASS with feature of
 * importing Shoreditch Partials and minifying the css file to .min.css
 *
 * Tasks
 * default : Runs sass and test task
 * sass:sync : Compiles civicase.scss under scss folder to CSS counterpart
 * sass: Compiles civicase.scss under scss folder to CSS counterpart
 * test: Runs Karma unit tests
 * backstopjs:reference: For creating reference screenshots
 * backstopjs:test: For creating test screenshots and matching them
 * backstopjs:openReport: For opening reports in the browser
 * backstopjs:approve: Approving reports
 * watch: Watches for scss and js file changes and run sass task
 */

'use strict';

var gulp = require('gulp');

var backstopJSTask = require('./gulp-tasks/backstopjs.js');
var sassTask = require('./gulp-tasks/sass.js');
var sassSyncTask = require('./gulp-tasks/sass-sync.js');
var testTask = require('./gulp-tasks/test.js');
var watchTask = require('./gulp-tasks/watch.js');

/**
 * The gulp task updates and sync the scssRoot paths
 */
gulp.task('sass:sync', sassSyncTask);

/**
 * Gulp sass task
 */
gulp.task('sass', ['sass:sync'], sassTask);

/**
 * Gulp unit tests task
 */
gulp.task('test', testTask);

/**
 * Gulp watch task
 */
gulp.task('watch', watchTask);

/**
 * Gulp backstop tasks
 */
['reference', 'test', 'openReport', 'approve'].map(backstopJSTask);

/**
 * Gulp default task
 */
gulp.task('default', ['sass', 'test']);
