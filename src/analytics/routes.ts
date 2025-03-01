import { Request, Response, Router } from 'express';

const router = Router();

router.post('/organizations', (req: Request, res: Response) => {
  console.log(req.body);
  res.json({ message: 'Organizations route' });
});

export { router };
