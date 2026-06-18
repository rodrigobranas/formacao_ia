import { useMemo } from 'react';
import { Droplets, Gauge, Thermometer, Wind } from 'lucide-react';
import type { WeatherMetric } from '@/types/weather-metric';
import type { WeatherResponse } from '@/types/weather-response';

export function useWeatherMetrics(weather: WeatherResponse | null): WeatherMetric[] {
  return useMemo(() => {
    if (!weather) {
      return [];
    }

    return [
      {
        label: 'Sensação',
        value: `${Math.round(weather.current.apparentTemperature)}${weather.units.apparentTemperature}`,
        icon: Thermometer,
        tone: 'text-amber-600 bg-amber-50',
      },
      {
        label: 'Umidade',
        value: `${weather.current.relativeHumidity}${weather.units.relativeHumidity}`,
        icon: Droplets,
        tone: 'text-cyan-700 bg-cyan-50',
      },
      {
        label: 'Vento',
        value: `${Math.round(weather.current.windSpeed)} ${weather.units.windSpeed}`,
        icon: Wind,
        tone: 'text-emerald-700 bg-emerald-50',
      },
      {
        label: 'Chuva',
        value: `${weather.current.precipitation} ${weather.units.precipitation}`,
        icon: Gauge,
        tone: 'text-violet-700 bg-violet-50',
      },
    ];
  }, [weather]);
}
