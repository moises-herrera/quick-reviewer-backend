import { Request, Response, Router } from 'express';

const analyticsRouter = Router();

analyticsRouter.post('/organizations', (req: Request, res: Response) => {
  console.log(req.body);
  res.json({ message: 'Organizations route' });
});

export { analyticsRouter };
