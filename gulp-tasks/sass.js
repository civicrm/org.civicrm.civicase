/**
 * @file
 * This file contains function for sass gulp task
 *
 * The gulp task compiles and minifies scss/civicase.scss file into css/civicase.min.css.
 * Also prefix the output css selector with `#bootstrap-theme` selector except the output.
 * selector starts from either `body`, `page-civicrm-case` or `.___outside-namespace` classes.
 */

'use strict';

var autoprefixer = require('gulp-autoprefixer');
var bulk = require('gulp-sass-bulk-import');
var civicrmScssRoot = require('civicrm-scssroot')();
var cssmin = require('gulp-cssmin');
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var postcssDiscardDuplicates = require('postcss-discard-duplicates');
var postcssPrefix = require('postcss-prefix-selector');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var stripCssComments = require('gulp-strip-css-comments');
var sourcemaps = require('gulp-sourcemaps');
var transformSelectors = require('gulp-transform-selectors');

var bootstrapNamespace = '#bootstrap-theme';
var outsideNamespaceRegExp = /^\.___outside-namespace/;

function sassTask () {
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
}

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

module.exports = sassTask;
