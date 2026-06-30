# useMemo for derived values

Wrap computed values, filtered lists, mapped data, and derived class names in `useMemo` with the correct dependency array.

## Lookup and label derived from props

```tsx
// ❌ BAD — recomputed every render
const STATUS_COLORS: Record<ApiStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-red-500',
  checking: 'bg-yellow-500',
};

export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-500';
  const label = status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Checking';

  return (
    <div className={colorClass}>
      <span>{label}</span>
    </div>
  );
}
```

```tsx
// ✅ GOOD
export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  const colorClass = useMemo(
    () => STATUS_COLORS[status] ?? 'bg-gray-500',
    [status],
  );

  const label = useMemo(() => {
    if (status === 'online') {
      return 'Online';
    }

    if (status === 'offline') {
      return 'Offline';
    }

    return 'Checking';
  }, [status]);

  return (
    <div className={colorClass}>
      <span>{label}</span>
    </div>
  );
}
```

## Filtered or mapped collections

```tsx
// ❌ BAD — new array reference on every render
export function WeatherMetricsGrid({ weather }: WeatherMetricsGridProps) {
  const metrics = weather
    ? [
        { label: 'Humidity', value: weather.current.humidity, unit: '%' },
        { label: 'Wind', value: weather.current.windSpeed, unit: 'km/h' },
      ]
    : [];

  return (
    <div>
      {metrics.map((metric) => (
        <WeatherMetricCard key={metric.label} label={metric.label} value={metric.value} unit={metric.unit} />
      ))}
    </div>
  );
}
```

```tsx
// ✅ GOOD — dedicated hook or useMemo inside component
export function useWeatherMetrics(weather: WeatherResponse | null): WeatherMetric[] {
  return useMemo(() => {
    if (!weather) {
      return [];
    }

    return [
      { label: 'Humidity', value: weather.current.humidity, unit: '%' },
      { label: 'Wind', value: weather.current.windSpeed, unit: 'km/h' },
    ];
  }, [weather]);
}
```

## Derived display strings

```tsx
// ❌ BAD
export function WeatherLocationDetails({ weather }: WeatherLocationDetailsProps) {
  const locationLine = weather
    ? `${weather.location.name}, ${weather.location.region}, ${weather.location.country}`
    : '';

  return <p>{locationLine}</p>;
}
```

```tsx
// ✅ GOOD
export function WeatherLocationDetails({ weather }: WeatherLocationDetailsProps) {
  const locationLine = useMemo(() => {
    if (!weather) {
      return '';
    }

    return `${weather.location.name}, ${weather.location.region}, ${weather.location.country}`;
  }, [weather]);

  return <p>{locationLine}</p>;
}
```

## When useMemo is not required

```tsx
// ✅ GOOD — primitive prop passed straight through; no derivation
export function WeatherTemperatureBlock({ temperature }: WeatherTemperatureBlockProps) {
  return <p className="text-5xl font-bold">{temperature}°C</p>;
}
```

Primitives and static JSX do not need `useMemo`. Apply it when a value is **derived** from props or state.
