import path from 'path';

/* Axe Service Defaults */
const axe = {
  /* Wheather or not to inject axe into the browser. */
  inject: true,
  /* Axe configiuration options. */
  options: undefined,
};

/* Express Dev Server Service Defaults */
const expressDevServer = {
  /* The port to start the express server on. */
  port: 8080,
  /* The base html template name. */
  index: 'index.html',
};

/* Default locale to run the tests. */
const locale = 'en';

/* Selenium Docker Service Defaults */
const seleniumDocker = {
  /* Weather or not the service should be ran. */
  enabled: true,
  /* Retry count to test for selenium being up. */
  retries: 2000,
  /* The retry interval (in milliseconds) to wait between retries.
   */
  retryInterval: 10,
  /* Docker compose file reference when deploying the docker selenium hub stack. */
  composeFile: path.join(__dirname, '..', 'docker-compose.yml'),
};

/* Terra Service Defaults */
const terra = {
  /* Global Terra seletor used by Terra commands. */
  // selector: '[data-terra-dev-site-content] *:first-child',
  selector: '[data-reactroot]',
  /* Visual regression naming configuration used by the default Visual Regression
   * Service configuration and the screenshot cleanup in the Terra Service.
   */
  screenshotSetup: {
    /* The name of the directory to save the screenshots in.
     * Service defaults to '__snapshots__'.
     */
    snapshotDir: '__snapshots__',
    /* The name of the directory to save the screenshots from the current test
     * run in. Service defaults to 'screenshot'.
     */
    screenshotDir: 'latest',
    /* The name of the directory to save the screenshots that will be stored as
     * correct. Service defaults to 'reference'.
     */
    referenceDir: 'reference',
    /* The name of the directory to save the diff'd screenshots in. Service
     * defaults to 'diff'.
     */
    diffDir: 'diff',
  },
};

export default {
  axe,
  expressDevServer,
  locale,
  seleniumDocker,
  terra,
};
