import { Router } from 'express';
import { router as analyticsRouter } from '../analytics/routes';
import { gitHubRouter } from 'src/github/routes';

const router = Router();

router.use('/api/github', gitHubRouter);

router.use('/api/analytics', analyticsRouter);

export { router };
