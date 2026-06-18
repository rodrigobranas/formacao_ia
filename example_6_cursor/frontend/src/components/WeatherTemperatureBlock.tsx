import { useMemo } from 'react';
import type { WeatherResponse } from '@/types/weather-response';

type WeatherTemperatureBlockProps = {
  weather: WeatherResponse;
};

export function WeatherTemperatureBlock({ weather }: WeatherTemperatureBlockProps) {
  const dayLabel = useMemo(
    () => (weather.current.isDay ? 'Dia' : 'Noite'),
    [weather.current.isDay],
  );

  return (
    <div className="text-left sm:text-right">
      <div className="text-6xl font-semibold leading-none text-foreground">
        {Math.round(weather.current.temperature)}
        <span className="text-3xl">{weather.units.temperature}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {dayLabel} · {weather.location.timezone}
      </p>
    </div>
  );
}
