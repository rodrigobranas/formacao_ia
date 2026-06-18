import type { WeatherMetric } from '@/types/weather-metric';
import type { WeatherResponse } from '@/types/weather-response';
import type { WeatherStatus } from '@/types/weather-status';
import { WeatherContent } from '@/components/WeatherContent';
import { WeatherLoadingState } from '@/components/WeatherLoadingState';
import { WeatherPlaceholder } from '@/components/WeatherPlaceholder';

type WeatherDisplayProps = {
  weather: WeatherResponse | null;
  metrics: WeatherMetric[];
  status: WeatherStatus;
};

export function WeatherDisplay({ weather, metrics, status }: WeatherDisplayProps) {
  if (status === 'loading' && !weather) {
    return <WeatherLoadingState />;
  }

  if (weather) {
    return <WeatherContent weather={weather} metrics={metrics} />;
  }

  return <WeatherPlaceholder />;
}
