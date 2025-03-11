import { Router } from 'express';
import { historyRouter } from 'src/history/history.router';
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

appRouter.use('/history', historyRouter);

appRouter.use('/statistics', statisticsRouter);

export { appRouter };
