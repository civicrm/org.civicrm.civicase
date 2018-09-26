/**
 * @file
 * This file contains gulp configurations for setting up SASS with feature of
 * importing Shoreditch Partials and minifying the css file to .min.css
 *
 * Tasks
 * default : Runs SASS task
 * sass: Compiles civicase.scss under scss folder to CSS counterpart
 * watch: Watches for scss file changes and run sass task
 */
'use strict';

var gulp = require('gulp');
var bulk = require('gulp-sass-bulk-import');
var sass = require('gulp-sass');
var civicrmScssRoot = require('civicrm-scssroot')();
var postcss = require('gulp-postcss');
var postcssPrefix = require('postcss-prefix-selector');
var postcssDiscardDuplicates = require('postcss-discard-duplicates');
var stripCssComments = require('gulp-strip-css-comments');
var transformSelectors = require('gulp-transform-selectors');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var karma = require('karma');
var path = require('path');

var bootstrapNamespace = '#bootstrap-theme';
var outsideNamespaceRegExp = /^\.___outside-namespace/;

/**
  * The gulp task updates and sync the scssRoot paths
  */
gulp.task('sass:sync', () => {
  civicrmScssRoot.updateSync();
});

/**
 * The gulp task compiles and minifies scss/civicase.scss file into css/civicase.min.css.
 * Also prefix the output css selector with `#bootstrap-theme` selector except the output.
 * selector starts from either `body`, `page-civicrm-case` or `.___outside-namespace` classes.
 */
gulp.task('sass', ['sass:sync'], function () {
  return gulp.src('scss/civicase.scss')
    .pipe(bulk())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: civicrmScssRoot.getPath(),
      precision: 10
    }).on('error', sass.logError))
    .pipe(stripCssComments({ preserve: false }))
    .pipe(postcss([postcssPrefix({
      prefix: bootstrapNamespace + ' ',
      exclude: [/^body/, /page-civicrm-case/, outsideNamespaceRegExp]
    }), postcssDiscardDuplicates]))
    .pipe(transformSelectors(removeOutsideNamespaceMarker, { splitOnCommas: true }))
    .pipe(cssmin({ sourceMap: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('css/'));
});

/**
 * Watch task
 */
gulp.task('watch', function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch(['ang/**/*.js', '!ang/test/karma.conf.js'], ['test']);
  gulp.watch(civicrmScssRoot.getWatchList(), ['sass']);
});

/**
 * Default task
 */
gulp.task('default', ['sass', 'test']);

/**
 * Deletes the special class that was used as marker for styles that should
 * not be nested inside the bootstrap namespace from the given selector
 *
 * @param  {String} selector
 * @return {String}
 */
function removeOutsideNamespaceMarker (selector) {
  return selector.replace(outsideNamespaceRegExp, '');
}

/**
 * Runs the unit tests
 */
gulp.task('test', function (done) {
  new karma.Server({
    configFile: path.resolve(__dirname, 'ang/test/karma.conf.js'),
    singleRun: true
  }, done).start();
});
