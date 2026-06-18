import { Router, Request, Response } from 'express';
import {
  getWeatherByCity,
  getWeatherByCoordinates,
  WeatherError,
} from '../services/weatherService';

const router = Router();

/**
 * GET /weather
 *
 * Query parameters (one of):
 *   - city: city name to look up, e.g. ?city=São Paulo
 *   - lat & lon: coordinates, e.g. ?lat=-23.55&lon=-46.63
 *
 * Coordinates take precedence over city when both are provided.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city, lat, lon } = req.query;
    const hasCoordinates = lat !== undefined || lon !== undefined;

    if (hasCoordinates) {
      if (lat === undefined || lon === undefined) {
        res
          .status(400)
          .json({ error: 'Informe "lat" e "lon" juntos' });
        return;
      }

      const latitude = Number(lat);
      const longitude = Number(lon);
      const weather = await getWeatherByCoordinates(latitude, longitude);
      res.json(weather);
      return;
    }

    const cityName = typeof city === 'string' ? city.trim() : '';
    if (!cityName) {
      res.status(400).json({
        error: 'Informe o parâmetro "city" ou "lat" e "lon"',
      });
      return;
    }

    const weather = await getWeatherByCity(cityName);
    res.json(weather);
  } catch (error) {
    if (error instanceof WeatherError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    console.error('Weather route error:', error);
    res.status(500).json({ error: 'Erro inesperado ao buscar o clima' });
  }
});

export default router;
