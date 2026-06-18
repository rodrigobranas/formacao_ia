import { Router, Request, Response } from 'express';
import {
  getWeatherByCity,
  getWeatherByCoordinates,
} from '../services/weather';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { city, lat, lon } = req.query;

    if (city && typeof city === 'string') {
      const weather = await getWeatherByCity(city);
      return res.json(weather);
    }

    if (lat && lon) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Latitude and longitude must be valid numbers',
        });
      }

      const weather = await getWeatherByCoordinates(latitude, longitude);
      return res.json(weather);
    }

    return res.status(400).json({
      error: 'Missing parameters',
      message: 'Provide either "city" or "lat" and "lon" query parameters',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to fetch weather data',
      message,
    });
  }
});

export default router;
