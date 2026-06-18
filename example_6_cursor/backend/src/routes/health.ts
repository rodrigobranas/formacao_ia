import { Router, Request, Response } from 'express';
import { buildHealthReport } from '../services/healthService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const report = buildHealthReport();
  res.json(report);
});

export default router;
