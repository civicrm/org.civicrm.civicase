'use strict';

/**
  * @file
  * This file contains gulp configurations for setting up SASS with feature of
  * importing Shoreditch Partials and minifying the css file to .min.css
  * This also adds sourcemaps if passed a --dev parameter
  * Tasks
  * default : Runs SASS task
  * sass:sync : Runs sass sync task for civicrmScssRoot
  * sass: Compiles civicase.scss under scss folder to CSS counterpart
  * watch: Watches for scss file changes and run sass task
  */

// Gulp related variables
const gulp = require('gulp');
const bulk = require('gulp-sass-bulk-import');
const sass = require('gulp-sass');
const argv = require('yargs').argv;
const postcss = require('gulp-postcss');
const postcssPrefix = require('postcss-prefix-selector');
const postcssDiscardDuplicates = require('postcss-discard-duplicates');
const stripCssComments = require('gulp-strip-css-comments');
const transformSelectors = require('gulp-transform-selectors');
const civicrmScssRoot = require('civicrm-scssroot')();
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');

// Local variables
const bootstrapNamespace = '#bootstrap-theme';
const outsideNamespaceRegExp = /^\.___outside-namespace/;

/**
  * The gulp task updates and sync the scssRoot paths
  */
gulp.task('sass:sync', () => {
  civicrmScssRoot.updateSync();
});

/**
  * The gulp task compiles civicase.scss file to civicase.min.css (minified file).
  * Also prefix the output css selector with `#bootstrap-theme` selector except the output.
  * selector starts from either `body`, `page-civicrm-case` or `.___outside-namespace` classes.
  * If passed parameter --dev adds source map file to the compiled css.
  */
gulp.task('sass', ['sass:sync'], () => {
  const development = argv.dev ? argv.dev : false;

  return gulp.src('scss/civicase.scss')
    .pipe(bulk())
    .pipe(gulpif(development, sourcemaps.init()))
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
    .pipe(gulpif(development, sourcemaps.write('.')))
    .pipe(gulp.dest('css/'));
});

/**
  * Watch task for watching scss files and compile them if
  * file changes.
  */
gulp.task('watch', () => {
  gulp.watch(civicrmScssRoot.getWatchList(), ['sass']);
});

/**
  * Default task calls sass task
  */
gulp.task('default', ['sass']);

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
