# Layer separation (pages → hooks → services)

Follow AGENTS.md: pages compose UI, hooks own state and effects, services own HTTP, components stay presentational.

## Fetch inside a component

```tsx
// ❌ BAD — component calls the API directly
export function ApiStatusIndicator() {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then((res) => res.json())
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'));
  }, []);

  return <div>{status}</div>;
}
```

```tsx
// ✅ GOOD — service + hook + presentational component
// services/healthService.ts
export async function fetchHealthStatus(): Promise<boolean> {
  const response = await fetch('http://localhost:3000/health');
  return response.ok;
}

// hooks/useApiStatus.ts
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

// components/ApiStatusIndicator.tsx
export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  const colorClass = useMemo(() => STATUS_COLORS[status] ?? 'bg-gray-500', [status]);
  return <div className={colorClass}>API Status</div>;
}

// pages/HomePage.tsx
export function HomePage() {
  const apiStatus = useApiStatus();
  return <ApiStatusIndicator status={apiStatus} />;
}
```

## Business logic in JSX event handlers

```tsx
// ❌ BAD — validation and API mapping inline in the component
export function WeatherSearchForm({ city, onCityChange }: WeatherSearchFormProps) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (city.trim().length === 0) {
      alert('Informe uma cidade.');
      return;
    }
    const response = await fetch(`/api/weather?city=${city}`);
    const data = await response.json();
    // transform data, set multiple states...
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

```tsx
// ✅ GOOD — hook exposes intent; service handles HTTP
export function WeatherSearchForm({
  city,
  status,
  errorMessage,
  onCityChange,
  onSearch,
  onUseLocation,
}: WeatherSearchFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(city);
      }}
    >
      <WeatherCityField city={city} onCityChange={onCityChange} />
      <Button disabled={status === 'loading'} type="submit">Search</Button>
      <Button type="button" onClick={onUseLocation}>Use my location</Button>
      {errorMessage.length > 0 && <WeatherErrorAlert message={errorMessage} />}
    </form>
  );
}
```

## Types duplicated inline instead of shared

```tsx
// ❌ BAD — inline object shape in multiple files
export function WeatherDisplay({ weather }: { weather: { location: { name: string }; current: { temperature: number } } | null }) {
  // ...
}
```

```tsx
// ✅ GOOD — type in types/weather-response.ts, imported everywhere
import type { WeatherResponse } from '@/types/weather-response';

type WeatherDisplayProps = {
  weather: WeatherResponse | null;
  status: WeatherStatus;
  metrics: WeatherMetric[];
};

export function WeatherDisplay({ weather, status, metrics }: WeatherDisplayProps) {
  // ...
}
```
