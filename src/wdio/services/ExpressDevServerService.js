import express from 'express';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import mime from 'mime-types';
import path from 'path';
import SERVICE_DEFAULTS from './_serviceDefaults';

const DEFAULTS = SERVICE_DEFAULTS.expressDevServer;

export default class ExpressDevServerService {
  async onPrepare(config) {
    const webpackConfig = config.webpackConfig;

    if (!webpackConfig) {
      // eslint-disable-next-line no-console
      console.log('[ExpresDevService] No webpack configuration provided');
      return;
    }

    const port = ((config || {}).expressDevServer || {}).port || DEFAULTS.port;
    const index = ((config || {}).expressDevServer || {}).index || DEFAULTS.index;
    const locale = config.locale || SERVICE_DEFAULTS.locale;

    await ExpressDevServerService.startExpressDevServer(webpackConfig, port, index, locale).then((server) => {
      this.server = server;
    });
  }

  async onComplete() {
    await this.stop();
  }

  static startExpressDevServer(webpackConfig, port, index, locale) {
    return ExpressDevServerService.compile(webpackConfig).then((fs) => {
      const app = express();
      const indexName = `/${index}`;
      // Setup a catch all route, we can't use 'static' because we need to use a virtual file system
      app.get('*', (req, res, next) => {
        let filename = req.url;
        // Setup a default index for the server.
        if (filename === '/') {
          filename = indexName;
        }

        const filepath = `${webpackConfig.output.path}${filename}`;

        if (fs.existsSync(filepath)) {
          res.setHeader('content-type', mime.contentType(path.extname(filename)));

          let fileContent = fs.readFileSync(filepath, 'utf8');
          if (filename === indexName) {
            const langPattern = /lang="[a-zA-Z0-9-]*"/;
            const isLanguageSet = fileContent.match(langPattern);
            if (isLanguageSet) {
              fileContent = fileContent.replace(langPattern, `lang="${locale}"`);
            } else {
              fileContent = fileContent.replace(/<html/, `<html lang="${locale}"`);
            }
          }

          res.send(fileContent);
        } else if (filename === '/favicon.ico') {
          res.sendStatus(200);
        } else {
          next();
        }
      });

      app.use((req, res, next) => {
        const err = new Error(`Not Found: ${req.originalUrl}`);
        err.status = 404;
        next(err);
      });

      // error handler
      app.use((err, req, res) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = err;

        // render the error page
        res.status(err.status || 500);
        res.render('error');
      });

      const server = app.listen(port);
      // eslint-disable-next-line no-console
      console.log('[ExpresDevService] Express server started');

      return server;
    });
  }

  static compile(webpackConfig) {
    return new Promise((resolve, reject) => {
      const compiler = webpack(webpackConfig);
      // setup a virtual file system to write webpack files to.
      compiler.outputFileSystem = new MemoryFS();
      // eslint-disable-next-line no-console
      console.log('[ExpresDevService] Webpack compilation started');
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          // eslint-disable-next-line no-console
          console.log('[ExpresDevService] Webpack compiled unsuccessfully');
          reject();
        }
        // eslint-disable-next-line no-console
        console.log('[ExpresDevService] Webpack compiled successfully');
        resolve(compiler.outputFileSystem);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-console
      console.log('[ExpresDevService] Closing Express server');
      if (this.server) {
        this.server.close();
        this.server = null;
      }
      resolve();
    });
  }
}
