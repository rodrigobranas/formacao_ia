# Hook naming — `use` prefix

Custom hooks must start with `use` so React and ESLint can enforce the Rules of Hooks. Plain functions that call hooks are hooks; rename them accordingly.

## Missing `use` prefix

```tsx
// ❌ BAD — calls hooks but is not named as a hook
export function apiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    void fetchHealthStatus().then((health) => {
      setStatus(health ? 'online' : 'offline');
    });
  }, []);

  return status;
}
```

```tsx
// ✅ GOOD
export function useApiStatus(): ApiStatus {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      const health = await fetchHealthStatus();
      setApiStatus(health ? 'online' : 'offline');
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return apiStatus;
}
```

## Misleading name for a non-hook helper

```tsx
// ❌ BAD — `use` prefix on a function that never calls hooks
export function useFormatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}
```

```tsx
// ✅ GOOD — reserve `use` for hooks; use a plain helper in lib/
export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}
```

## Hook called conditionally because of bad naming

```tsx
// ❌ BAD — looks like a regular function, easy to call inside a branch
function getWeatherMetrics(weather: WeatherResponse | null) {
  const metrics = useMemo(() => buildMetrics(weather), [weather]);
  return metrics;
}

export function WeatherPanel() {
  if (someFlag) {
    const metrics = getWeatherMetrics(weather); // Rules of Hooks violation
  }
}
```

```tsx
// ✅ GOOD — `use` prefix signals hook rules at call site
export function useWeatherMetrics(weather: WeatherResponse | null) {
  return useMemo(() => buildMetrics(weather), [weather]);
}

export function WeatherPanel() {
  const { weather } = useWeather();
  const metrics = useWeatherMetrics(weather); // always top level
}
```
