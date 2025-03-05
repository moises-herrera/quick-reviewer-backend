import { Router } from 'express';
import { analyticsRouter } from 'src/analytics/analytics.router';
import { gitHubRouter } from 'src/github/github.router';
import { HealthCheckController } from './controllers/health-check.controller';

const appRouter = Router();
const healthCheckController = new HealthCheckController();

appRouter.get(
  '/health-check',
  healthCheckController.getHealthStatus.bind(healthCheckController),
);

appRouter.use('/github', gitHubRouter);

appRouter.use('/analytics', analyticsRouter);

export { appRouter };
