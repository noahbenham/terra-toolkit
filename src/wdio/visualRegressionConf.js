import path from 'path';
import { LocalCompare } from 'wdio-visual-regression-service/compare';
import SERVICE_DEFAULTS from './services/_serviceDefaults';

const DEFAULTS = SERVICE_DEFAULTS.terra;

const testIdRegex = /\[([^)]+)\]/;

function createTestName(fullName) {
  const matches = testIdRegex.exec(fullName);
  let name = fullName.trim().replace(/[\s+.]/g, '_');
  if (matches) {
    name = matches[1];
  }

  return name;
}

function getScreenshotName(context) {
  const browserWidth = context.meta.viewport.width;
  const browserHeight = context.meta.viewport.height;
  const parentName = createTestName(context.test.parent);
  const testName = createTestName(context.test.title);

  return `${parentName}[${testName}].${browserWidth}x${browserHeight}.png`;
}

function getScreenshotPath(ref, context) {
  const screenshotSetup = (global.browser.options.terra || {}).screenshotSetup || DEFAULTS.screenshotSetup;
  const snapshotDir = screenshotSetup.snapshotDir || DEFAULTS.snapshotDir;
  const refDir = screenshotSetup[`${ref}Dir`] || DEFAULTS[`${ref}Dir`];
  const locale = global.browser.options.locale || SERVICE_DEFAULTS.locale;
  const browserName = context.desiredCapabilities.browserName;
  const testSuite = path.parse(context.test.file).name;

  return path.join(snapshotDir, refDir, locale, browserName, testSuite);
}

function getScreenshotLocation(ref) {
  return (context) => {
    const testPath = path.dirname(context.test.file);
    return path.join(testPath, getScreenshotPath(ref, context), getScreenshotName(context));
  };
}

module.exports = {
  compare: new LocalCompare({
    referenceName: getScreenshotLocation('reference'),
    screenshotName: getScreenshotLocation('screenshot'),
    diffName: getScreenshotLocation('diff'),
    misMatchTolerance: 0.01,
  }),
  viewportChangePause: 100,
  widths: [],
};
