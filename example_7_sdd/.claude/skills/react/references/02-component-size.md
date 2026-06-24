# Component size (max 30 lines)

Pages compose hooks and components. Keep JSX shallow; move state, effects, and fetch logic into hooks or services.

## Page doing everything inline

```tsx
// ❌ BAD — fetch, interval, form state, and large JSX in one component
export function WeatherPanel() {
  const [city, setCity] = useState('São Paulo');
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    void fetchWeatherByCity(city).then((result) => {
      if (result.error) {
        setStatus('error');
        setErrorMessage(result.error);
        return;
      }
      setWeather(result.data);
      setStatus('success');
    });
  }, [city]);

  const metrics = weather
    ? [
        { label: 'Humidity', value: `${weather.current.humidity}%` },
        { label: 'Wind', value: `${weather.current.windSpeed} km/h` },
      ]
    : [];

  return (
    <section>
      <input value={city} onChange={(e) => setCity(e.target.value)} />
      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && <p>{errorMessage}</p>}
      {weather && (
        <div>
          <h2>{weather.location.name}</h2>
          <p>{weather.current.temperature}°C</p>
          <ul>
            {metrics.map((m) => (
              <li key={m.label}>{m.label}: {m.value}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
```

```tsx
// ✅ GOOD — page stays small; logic lives in hooks
export function WeatherPanel() {
  const {
    city,
    setCity,
    weather,
    status,
    errorMessage,
    searchByCity,
    requestUserLocation,
  } = useWeather();

  const metrics = useWeatherMetrics(weather);

  return (
    <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
      <WeatherSearchForm
        city={city}
        errorMessage={errorMessage}
        onCityChange={setCity}
        onSearch={searchByCity}
        onUseLocation={requestUserLocation}
        status={status}
      />
      <WeatherDisplay metrics={metrics} status={status} weather={weather} />
    </section>
  );
}
```

## Inline sub-UI that should be a component

```tsx
// ❌ BAD — repeated markup and branching bloat the parent
export function WeatherDisplay({ weather, status }: WeatherDisplayProps) {
  return (
    <div>
      {status === 'idle' && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <CloudSun className="h-10 w-10" />
          <p>Search for a city to see the forecast.</p>
        </div>
      )}
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-2 py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading weather...</p>
        </div>
      )}
      {/* more branches... */}
    </div>
  );
}
```

```tsx
// ✅ GOOD — each visual state is its own small component
export function WeatherDisplay({ weather, status, metrics }: WeatherDisplayProps) {
  if (status === 'idle') {
    return <WeatherPlaceholder />;
  }

  if (status === 'loading') {
    return <WeatherLoadingState />;
  }

  if (status === 'error' || !weather) {
    return <WeatherErrorAlert message="Unable to load weather." />;
  }

  return <WeatherContent metrics={metrics} weather={weather} />;
}
```
