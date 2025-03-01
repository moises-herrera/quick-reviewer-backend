import express from 'express';
import morgan from 'morgan';
import { envConfig } from 'src/config/env-config';
import { middleware } from './github/webhooks-config';
import { router } from './router';

const PORT = envConfig.PORT || 3000;

const app = express();

app.set('port', PORT);

app.use(middleware as any);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(router);

export default app;
