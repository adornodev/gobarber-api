import * as Sentry from '@sentry/node';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import path from 'path';
import Youch from 'youch';
import sentryConfig from './config/sentry';
import './database';
import routes from './routes';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);
    this.middleware();
    this.routes();
    this.exceptionHandler();
  }

  middleware() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json());

    // Permite servir arquivos estáticos
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(
      Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
          // Capture all 404 and 500 errors
          if (error.status === 404 || error.status === 500) {
            return true;
          }
          return false;
        },
      })
    );
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();

      return res.status(500).json(errors);
    });
  }
}

export default new App().server;
