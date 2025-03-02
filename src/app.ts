import express from 'express';
import morgan from 'morgan';
import { envConfig } from 'src/config/env-config';
import { gitHubWebhooksMiddleware } from './github/webhooks-config';
import { router } from './router';
import { connectToDatabase } from './database/db-connection';
import { exceptionMiddleware } from './common/middlewares/exception.middleware';

const PORT = envConfig.PORT || 3000;

const app = express();

app.set('port', PORT);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(gitHubWebhooksMiddleware as any);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(router);

app.use(exceptionMiddleware);

connectToDatabase();

export { app };
