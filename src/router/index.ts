import { Router } from 'express';
import { router as analyticsRouter } from '../analytics/routes';

const router = Router();

router.use('/api/analytics', analyticsRouter);

export { router };
