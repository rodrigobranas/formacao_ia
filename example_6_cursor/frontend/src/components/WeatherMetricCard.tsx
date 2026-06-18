import { useMemo } from 'react';
import type { WeatherMetric } from '@/types/weather-metric';

type WeatherMetricCardProps = {
  metric: WeatherMetric;
};

export function WeatherMetricCard({ metric }: WeatherMetricCardProps) {
  const Icon = metric.icon;
  const iconClassName = useMemo(
    () => `rounded-md p-2 ${metric.tone}`,
    [metric.tone],
  );

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
        <span className={iconClassName}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-foreground">{metric.value}</p>
    </div>
  );
}
