import { Router } from 'express';
import { accountsRouter } from 'src/accounts/accounts.router';
import { gitHubRouter } from 'src/github/github.router';
import { HealthCheckController } from './controllers/health-check.controller';
import { statisticsRouter } from 'src/statistics/statistics.router';

const appRouter = Router();
const healthCheckController = new HealthCheckController();

appRouter.get(
  '/health-check',
  healthCheckController.getHealthStatus.bind(healthCheckController),
);

appRouter.use('/github', gitHubRouter);

appRouter.use('/accounts', accountsRouter);

appRouter.use('/statistics', statisticsRouter);

export { appRouter };
