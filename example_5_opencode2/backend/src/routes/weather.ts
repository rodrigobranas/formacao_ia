import { Router, Request, Response, NextFunction } from 'express'
import {
  fetchWeatherByCity,
  fetchWeatherByCoordinatesWithLocation,
  WeatherError,
} from '../services/weatherService'

const router = Router()

function isWeatherError(error: unknown): error is WeatherError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as WeatherError).status === 'number'
  )
}

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city, lat, lon } = req.query

      if (typeof city === 'string' && city.trim().length > 0) {
        const weather = await fetchWeatherByCity(city.trim())
        res.json(weather)
        return
      }

      if (typeof lat === 'string' && typeof lon === 'string') {
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          res.status(400).json({
            error: 'Coordenadas inválidas.',
          })
          return
        }

        const weather = await fetchWeatherByCoordinatesWithLocation(
          latitude,
          longitude
        )
        res.json(weather)
        return
      }

      res.status(400).json({
        error: 'Informe uma cidade (?city=...) ou coordenadas (?lat=&lon=).',
      })
    } catch (error) {
      if (isWeatherError(error)) {
        res.status(error.status).json({ error: error.message })
        return
      }
      next(error)
    }
  }
)

export default router
