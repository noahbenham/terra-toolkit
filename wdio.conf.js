// eslint-disable-next-line import/no-extraneous-dependencies
const wdioConf = require('./lib/wdio/conf');
const webpackConfig = require('./tests/test.config.js');

const config = {
  ...wdioConf.config,
  // Configuration for ExpressDevServer
  webpackConfig,

  axe: {
    inject: true,
    options: {
      rules: [{
        id: 'landmark-one-main',
        enabled: false,
      }],
    },
  },
};

exports.config = config;
