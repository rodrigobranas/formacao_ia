import type { WeatherMetric } from '@/types/weather-metric';
import type { WeatherResponse } from '@/types/weather-response';
import { WeatherCurrentSummary } from '@/components/WeatherCurrentSummary';
import { WeatherLocationDetails } from '@/components/WeatherLocationDetails';
import { WeatherMetricsGrid } from '@/components/WeatherMetricsGrid';

type WeatherContentProps = {
  weather: WeatherResponse;
  metrics: WeatherMetric[];
};

export function WeatherContent({ weather, metrics }: WeatherContentProps) {
  return (
    <div className="flex h-full flex-col">
      <WeatherCurrentSummary weather={weather} />
      <WeatherMetricsGrid metrics={metrics} />
      <WeatherLocationDetails weather={weather} />
    </div>
  );
}
