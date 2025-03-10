import express from 'express';
import morgan from 'morgan';
import { envConfig } from 'src/config/env-config';
import { gitHubWebhooksMiddleware } from '../github/webhooks-config';
import { appRouter } from './app.router';
import { connectToDatabase } from '../database/db-connection';
import {
  handleHttpException,
  handleNotFoundRoute,
} from '../common/middlewares/handle-http-exception.middleware';
import { sessionMiddleware } from '../common/middlewares/session.middleware';
import { API_PREFIX } from '../constants/api';
import cors from 'cors';
import '../common/utils/big-int-serializer';
import cookieParser from 'cookie-parser';

const PORT = envConfig.PORT || 3000;

const app = express();

app.set('PORT', PORT);

app.use(
  cors({
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(cookieParser());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(gitHubWebhooksMiddleware as any);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(sessionMiddleware);

app.use(API_PREFIX, appRouter);

app.use(handleNotFoundRoute);

app.use(handleHttpException);

connectToDatabase();

export { app };
