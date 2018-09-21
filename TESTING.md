# CiviCase v5: Testing

## Tests (Buildkit)

If you have created the build using `civibuild`, then simply run `phpunit4`:

```
me@localhost:~/buildkit/build/dcase/sites/all/modules/civicrm/ext/civicase$ phpunit4
PHPUnit 4.8.21 by Sebastian Bergmann and contributors.

...................................................

Time: 16.86 seconds, Memory: 52.25Mb

OK (51 tests, 381 assertions)
```

## Tests (Manual)

If you have created the build by other means, you may need to provide some
configuration details that help with executing the tests, such as

 * Credentials for an administrative CMS user (`ADMIN_USER`, `ADMIN_PASS`, `ADMIN_EMAIL`)
 * Credentials for a non-administrative CMS user (`DEMO_USER`, `DEMO_PASS`, `DEMO_EMAIL`)
 * Credentials for an empty test database (`TEST_DB_DSN`)

To initialize the configuration file, run [`cv vars:fill`](https://github.com/civicrm/cv):

```
me@localhost:~/buildkit/build/dcase/sites/all/modules/civicrm/ext/civicase$ cv vars:fill
Site: /home/me/buildkit/build/dcase/sites/default/civicrm.settings.php
These fields were missing. Setting defaults:
{
  "ADMIN_EMAIL" => "admin@example.com",
  "ADMIN_PASS" => "t0ps3cr3t",
  "ADMIN_USER" => "admin",
  "TEST_DB_DSN" => "mysql://dbUser:dbPass@dbHost/dbName?new_link=true"
}
Please edit /home/me/.cv.json
```

Then edit that file:

```
me@localhost:~/buildkit/build/dcase/sites/all/modules/civicrm/ext/civicase$ vi ~/.cv.json
```

Now run the tests

```
me@localhost:~/buildkit/build/dcase/sites/all/modules/civicrm/ext/civicase$ phpunit4
PHPUnit 4.8.21 by Sebastian Bergmann and contributors.

...................................................

Time: 16.86 seconds, Memory: 52.25Mb

OK (51 tests, 381 assertions)
```

## BackstopJS Visual Regression testing
This test suite is based on [BackstopJS](https://garris.github.io/BackstopJS) plugin. Backstop JS uses pupetter and headless chrome to create reference screenshots and use them to compare new screenshots and raise any incosistency in the visuals of the page (if introduced while developing something)

***Note**: The backstop test suite for now only covers screens that are exposed by civicase *component* (and not the extension) that comes by default with core.

Documentation available [here](https://github.com/garris/BackstopJS#backstopjs)

#### Steps to setup

1. Install node package depedencies using . (Skip this step if already installed)
```shell
npm install 
```
2. Create a `test/backstop/site-config.json` file with the following content.
    ```json
    {
      "url": "your_local_url",
      "root": "absolute_path_to_site"
    }
    ```
3. Create the reference screenshots
    ```shell
    gulp backstopjs:reference
    ```
4. Create the test screenshots and compare
    ```shell
    gulp backstopjs:test
    ```

#### Parallel capturing
BackstopJS supports taking multiple screenshot at once. Change the value of `asyncCaptureLimit` in _backstop.tpl.json_ to decide how many screenshots you want to take in parallel

***Note**: Please be aware that BackstopJS performance is heavily dependent on the specs of the machine it runs on, so make sure to choose a value that the tool can handle on your machine (otherwise you will encounter random timeout errors)*
