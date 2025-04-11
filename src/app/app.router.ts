import { Router } from 'express';
import { historyRouter } from 'src/history/routes/history.router';
import { gitHubRouter } from 'src/github/routes/github.router';
import { statisticsRouter } from 'src/statistics/routes/statistics.router';
import { StatusCodes } from 'http-status-codes';
import { docsConfig } from 'src/app/config/docs-config';
import swaggerUi from 'swagger-ui-express';

const appRouter = Router();

appRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(docsConfig));

appRouter.get('/health-check', (_req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

appRouter.use('/github', gitHubRouter);

appRouter.use('/history', historyRouter);

appRouter.use('/statistics', statisticsRouter);

export { appRouter };
