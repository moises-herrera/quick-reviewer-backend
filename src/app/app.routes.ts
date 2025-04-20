import { Router } from 'express';
import { historyRouter } from 'src/history/routes/history.routes';
import { gitHubRouter } from 'src/github/routes/github.routes';
import { statisticsRouter } from 'src/statistics/routes/statistics.routes';
import { StatusCodes } from 'http-status-codes';
import { docsConfig } from 'src/app/config/docs-config';
import swaggerUi from 'swagger-ui-express';
import { accountsRouter } from 'src/accounts/routes/account.routes';
import { repositoriesRouter } from 'src/repositories/routes/repositories.routes';

const appRouter = Router();

appRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(docsConfig));

appRouter.get('/health-check', (_req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

appRouter.use('/github', gitHubRouter);

appRouter.use('/history', historyRouter);

appRouter.use('/statistics', statisticsRouter);

appRouter.use('/accounts', accountsRouter);

appRouter.use('/repositories', repositoriesRouter);

export { appRouter };
