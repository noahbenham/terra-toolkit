import express from 'express';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import mime from 'mime-types';
import path from 'path';

export default class ExpressDevServerService {
  async onPrepare(config) {
    const webpackConfig = config.webpackConfig;

    if (!webpackConfig) {
      // eslint-disable-next-line no-console
      console.log('[ExpressDevService] No webpack configuration provided');
      return;
    }

    const port = ((config || {}).expressDevServer || {}).port || 8080;
    const index = ((config || {}).expressDevServer || {}).index || 'index.html';
    const locale = (config || {}).locale || 'en';

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

      // Setup a catch all route, we can't use 'static' because we need to use a virtual file system
      app.get('*', (req, res, next) => {
        let filename = req.url;

        // Setup a default index for the server.
        if (filename === '/') {
          filename = `/${index}`;
        } else if (filename === '/favicon.ico') {
          res.sendStatus(200);
          return;
        }

        const filepath = `${webpackConfig.output.path}${filename}`;

        if (fs.existsSync(filepath)) {
          res.setHeader('content-type', mime.contentType(path.extname(filename)));

          let fileContent = fs.readFileSync(filepath, 'utf8');

          const langPattern = /lang="[a-zA-Z0-9-]*"/;
          const langLocale = `lang="${locale}"`;

          const isLanguageSet = fileContent.match(langPattern);

          // Set the test locale for the file
          if (isLanguageSet) {
            fileContent = fileContent.replace(langPattern, langLocale);
          } else {
            fileContent = fileContent.replace(/<html/, `<html ${langLocale}`);
          }

          res.send(fileContent);
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
      console.log('[ExpressDevService] Express server started');

      return server;
    });
  }

  static compile(webpackConfig) {
    return new Promise((resolve, reject) => {
      const compiler = webpack(webpackConfig);
      // setup a virtual file system to write webpack files to.
      compiler.outputFileSystem = new MemoryFS();
      // eslint-disable-next-line no-console
      console.log('[ExpressDevService] Webpack compilation started');
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          // eslint-disable-next-line no-console
          console.log('[ExpressDevService] Webpack compiled unsuccessfully');
          reject(err || new Error(stats.toJson().errors));
        }
        // eslint-disable-next-line no-console
        console.log('[ExpressDevService] Webpack compiled successfully');
        resolve(compiler.outputFileSystem);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-console
      console.log('[ExpressDevService] Closing WebpackDevServer');
      if (this.server) {
        this.server.close();
        this.server = null;
      }
      resolve();
    });
  }
}
