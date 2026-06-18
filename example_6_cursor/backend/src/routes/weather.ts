import { Router, Request, Response, NextFunction } from 'express';
import { buildWeatherReport } from '../services/weatherService';
import type { WeatherQuery } from '../types/weather-query';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: WeatherQuery = {
      city: typeof req.query.city === 'string' ? req.query.city : undefined,
      latitude: typeof req.query.latitude === 'string' ? req.query.latitude : undefined,
      longitude: typeof req.query.longitude === 'string' ? req.query.longitude : undefined,
    };

    const report = await buildWeatherReport(query);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
