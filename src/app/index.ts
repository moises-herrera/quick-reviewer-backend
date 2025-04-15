import express from 'express';
import morgan from 'morgan';
import { envConfig } from 'src/app/config/env-config';
import { gitHubWebhooksMiddleware } from 'src/github/config/webhooks-config';
import { appRouter } from './app.routes';
import { DbClient } from 'src/common/database/db-client';
import {
  handleHttpException,
  handleNotFoundRoute,
} from 'src/common/middlewares/handle-http-exception.middleware';
import { API_PREFIX } from 'src/common/constants/api';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { container } from 'src/app/config/container-config';

export const createApp = () => {
  const PORT = envConfig.PORT || 3000;

  const app = express();

  app.set('PORT', PORT);

  app.use(
    cors({
      origin: [envConfig.FRONTEND_URL, envConfig.BACKEND_URL],
      credentials: true,
    }),
  );

  app.use(cookieParser());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use(gitHubWebhooksMiddleware as any);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.use(API_PREFIX, appRouter);

  app.use(handleNotFoundRoute);

  app.use(handleHttpException);

  const dbClient = container.get(DbClient);

  dbClient.connectToDatabase();

  return app;
};
