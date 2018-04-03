const AxeService = require('./services').Axe;
const TerraService = require('./services').Terra;
const SeleniumDockerService = require('./services').SeleniumDocker;
const ExpressDevService = require('./services').ExpressDevService;
const visualRegressionConfig = require('./visualRegressionConf');
const localIP = require('ip');
const path = require('path');
const SERVICE_DEFAULTS = require('./services/_serviceDefaults').default;

/* Determine if the process call in from the package-level of a mono-repo */
let specs = path.join('tests', 'wdio', '**', '*-spec.js');
if (process.cwd().includes('packages')) {
  specs = path.join('packages', '*', specs);
}

const port = process.env.PORT || 8080;

exports.config = {
  baseUrl: `http://${localIP.address()}:${port}`,
  specs,
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'chrome',
    },
  ],

  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  bail: 0,
  screenshotPath: path.join('.', 'errorScreenshots'),
  waitforTimeout: 3000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 20000,
  },

  services: ['visual-regression', AxeService, TerraService, SeleniumDockerService, ExpressDevService],

  /* The locale to run the tests. */
  locale: SERVICE_DEFAULTS.locale,

  /* Visual Regression Service Options.
   * Config Options:
   *     https://github.com/zinserjan/wdio-visual-regression-service#configuration.
   * Default config saves screenshots using this pattern:
   *     /snapshot_dir/ref_dir/locale/browser/test_suite/test_parent[test_name].widthxheight.png
   */
  visualRegression: visualRegressionConfig,

  /* Axe Service Options */
  axe: {
    /* Wheather or not to inject axe into the browser. */
    inject: SERVICE_DEFAULTS.axe.inject,
    /* Axe configiuration options. */
    options: SERVICE_DEFAULTS.axe.options,
  },

  /* Terra Configuration Options */
  terra: {
    /* Global Terra seletor used by Terra commands. */
    selector: SERVICE_DEFAULTS.terra.selector,
    /* Visual regression naming configuration used by the default Visual Regression
     * Service configuration and the screenshot cleanup in the Terra Service.
     */
    screenshotSetup: {
      /* The name of the directory to save the screenshots in. */
      snapshotDir: SERVICE_DEFAULTS.terra.screenshotSetup.snapshotDir,
      /* The name of the directory to save the screenshots from the current test run in. */
      screenshotDir: SERVICE_DEFAULTS.terra.screenshotSetup.screenshotDir,
      /* The name of the directory to save the screenshots that will be stored as correct. */
      referenceDir: SERVICE_DEFAULTS.terra.screenshotSetup.referenceDir,
      /* The name of the directory to save the diff'd screenshots in. */
      diffDir: SERVICE_DEFAULTS.terra.screenshotSetup.diffDir,
    },
  },

  /* Selenium Docker Service Options */
  seleniumDocker: {
    /* Weather or not the service should be ran. */
    enabled: SERVICE_DEFAULTS.seleniumDocker.enabled,
    /* Retry count to test for selenium being up. */
    retries: SERVICE_DEFAULTS.seleniumDocker.retries,
    /* The retry interval (in milliseconds) to wait between retries.
     */
    retryInterval: SERVICE_DEFAULTS.seleniumDocker.retryInterval,
    /* Docker compose file reference when deploying the docker selenium hub stack. */
    composeFile: SERVICE_DEFAULTS.seleniumDocker.composeFile,
  },

  /* Express Dev Server Service Options */
  expressDevServer: {
    /* The port to start the express server on. */
    port: SERVICE_DEFAULTS.expressDevServer.port,
    /* The base html template name. */
    index: SERVICE_DEFAULTS.expressDevServer.index,
  },
};
