import type { WeatherMetric } from '@/types/weather-metric';
import { WeatherMetricCard } from '@/components/WeatherMetricCard';

type WeatherMetricsGridProps = {
  metrics: WeatherMetric[];
};

export function WeatherMetricsGrid({ metrics }: WeatherMetricsGridProps) {
  return (
    <div className="grid gap-3 py-5 sm:grid-cols-2">
      {metrics.map((metric) => (
        <WeatherMetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
