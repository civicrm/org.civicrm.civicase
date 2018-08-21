'use strict';

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
const gulp = require('gulp');
const bulk = require('gulp-sass-bulk-import');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const postcssPrefix = require('postcss-prefix-selector');
const postcssDiscardDuplicates = require('postcss-discard-duplicates');
const stripCssComments = require('gulp-strip-css-comments');
const transformSelectors = require('gulp-transform-selectors');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const bootstrapNamespace = '#bootstrap-theme';
const outsideNamespaceRegExp = /^\.___outside-namespace/;

/**
 * The gulp task compiles and minifies scss/civicase.scss file into css/civicase.min.css.
 * Also prefix the output css selector with `#bootstrap-theme` selector except the output.
 * selector starts from either `body`, `page-civicrm-case` or `.___outside-namespace` classes.
 */
gulp.task('sass', () => {
  return gulp.src('scss/civicase.scss')
    .pipe(bulk())
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
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
 * Watch task for watching scss files and compile them if
 * file changes.
 */
gulp.task('watch', () => {
  gulp.watch('scss/**/*.scss', ['sass']);
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
