/**
 * @file
 * Contains functional configurations for setting up backstopJS test suite
 */

'use strict';

var _ = require('lodash');
var argv = require('yargs').argv;
var backstopjs = require('backstopjs');
var clean = require('gulp-clean');
var colors = require('ansi-colors');
var execSync = require('child_process').execSync;
var file = require('gulp-file');
var fs = require('fs');
var gulp = require('gulp');
var notify = require('gulp-notify');
var path = require('path');
var PluginError = require('plugin-error');
var puppeteer = require('puppeteer');

var BACKSTOP_DIR = 'tests/backstop_data/';
var CONFIG_TPL = {
  'url': 'http://%{site-host}',
  'drush_alias': '',
  'root': '%{path-to-site-root}'
};
var FILES = {
  siteConfig: path.join(BACKSTOP_DIR, 'site-config.json'),
  temp: path.join(BACKSTOP_DIR, 'backstop.temp.json'),
  tpl: path.join(BACKSTOP_DIR, 'backstop.tpl.json')
};

/**
 * Returns the list of the scenarios from
 *   a. All the different groups if `group` is == '_all_',
 *   b. Only the given group
 *
 * @param {String} group
 * @return {Array}
 */
function buildScenariosList (group) {
  const config = siteConfig();
  const dirPath = path.join(BACKSTOP_DIR, 'scenarios');

  return _(fs.readdirSync(dirPath))
    .filter(scenario => {
      return (group === '_all_' ? true : scenario === `${group}.json`) && scenario.endsWith('.json');
    })
    .map(scenario => {
      return JSON.parse(fs.readFileSync(path.join(dirPath, scenario))).scenarios;
    })
    .flatten()
    .map((scenario, index, scenarios) => {
      return _.assign(scenario, {
        cookiePath: path.join(BACKSTOP_DIR, 'cookies', 'admin.json'),
        count: '(' + (index + 1) + ' of ' + scenarios.length + ')',
        url: scenario.url.replace('{url}', config.url)
      });
    })
    .value();
}

/**
 * Removes the temp config file and sends a notification
 * based on the given outcome from BackstopJS
 *
 * @param {Boolean} success
 */
function cleanUpAndNotify (success) {
  gulp
    .src(FILES.temp, { read: false })
    .pipe(clean())
    .pipe(notify({
      message: success ? 'Success' : 'Error',
      title: 'BackstopJS',
      sound: 'Beep'
    }));
}

/**
 * Creates the content of the config temporary file that will be fed to BackstopJS
 * The content is the mix of the config template and the list of scenarios
 * under the scenarios/ folder
 *
 * @return {String}
 */
function createTempConfig () {
  var group = argv.group ? argv.group : '_all_';
  var list = buildScenariosList(group);
  var content = JSON.parse(fs.readFileSync(FILES.tpl));

  content.scenarios = list;

  ['bitmaps_reference', 'bitmaps_test', 'html_report', 'ci_report', 'engine_scripts'].forEach(path => {
    content.paths[path] = BACKSTOP_DIR + content.paths[path];
  });

  return JSON.stringify(content);
}

/**
 * Runs backstopJS with the given command.
 *
 * It fills the template file with the list of scenarios, creates a temp
 * file passed to backstopJS, then removes the temp file once the command is completed
 *
 * @param  {String} command
 * @return {Promise}
 */
function runBackstopJS (command) {
  if (touchSiteConfigFile()) {
    throwError(
      'No site-config.json file detected!\n' +
      `\tOne has been created for you under ${path.basename(BACKSTOP_DIR)}\n` +
      '\tPlease insert the real value for each placeholder and try again'
    );
  }

  return new Promise((resolve, reject) => {
    let success = false;

    gulp.src(FILES.tpl)
      .pipe(file(path.basename(FILES.temp), createTempConfig()))
      .pipe(gulp.dest(BACKSTOP_DIR))
      .on('end', async () => {
        try {
          (typeof argv.skipCookies === 'undefined') && await writeCookies();
          await backstopjs(command, { configPath: FILES.temp, filter: argv.filter });

          success = true;
        } finally {
          cleanUpAndNotify(success);

          success ? resolve() : reject(new Error('BackstopJS error'));
        }
      });
  })
    .catch(function (err) {
      throwError(err.message);
    });
}

/**
 * Returns the content of site config file
 *
 * @return {Object}
 */
function siteConfig () {
  return JSON.parse(fs.readFileSync(FILES.siteConfig));
}

/**
 * Creates the site config file is in the backstopjs folder, if it doesn't exists yet
 *
 * @return {Boolean} Whether the file had to be created or not
 */
function touchSiteConfigFile () {
  let created = false;

  try {
    fs.readFileSync(FILES.siteConfig);
  } catch (err) {
    fs.writeFileSync(FILES.siteConfig, JSON.stringify(CONFIG_TPL, null, 2));

    created = true;
  }

  return created;
}

/**
 * A simple wrapper for displaying errors
 * It converts the tab character to the amount of spaces required to correctly
 * align a multi-line block of text horizontally
 *
 * @param {String} msg
 * @throws {Error}
 */
function throwError (msg) {
  throw new PluginError('Error', {
    message: colors.red(msg.replace(/\t/g, '    '))
  });
}

/**
 * Writes the session cookie files that will be used to log in as different users
 *
 * It uses the [`drush uli`](https://drushcommands.com/drush-7x/user/user-login/)
 * command to generate a one-time login url, the browser then go to that url
 * which then creates the session cookie
 *
 * The cookie is then stored in a json file which is used by the BackstopJS scenarios
 * to log in
 *
 * @return {Promise}
 */
async function writeCookies () {
  var cookiesDir = path.join(BACKSTOP_DIR, 'cookies');
  var cookieFilePath = path.join(cookiesDir, 'admin.json');
  var config = siteConfig();
  var command = `drush ${config.drush_alias} uli --name=admin --uri=${config.url} --browser=0`;
  var loginUrl = execSync(command, { encoding: 'utf8', cwd: config.root });
  var browser = await puppeteer.launch();
  var page = await browser.newPage();

  await page.goto(loginUrl);

  var cookies = await page.cookies();
  await browser.close();

  !fs.existsSync(cookiesDir) && fs.mkdirSync(cookiesDir);
  fs.existsSync(cookieFilePath) && fs.unlinkSync(cookieFilePath);

  fs.writeFileSync(cookieFilePath, JSON.stringify(cookies));
}

/**
 * Exports backstopJS related tasks task
 *
 * @param {String} action
 */
module.exports = (action) => {
  gulp.task('backstopjs:' + action, () => runBackstopJS(action));
};
