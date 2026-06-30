# Explicit props — no spread on children

List each prop by name when rendering child components. Avoid `{...props}` and `{...rest}` so the public API stays visible and typed.

## Spreading prop bags

```tsx
// ❌ BAD — hides which props reach the child
type WeatherSearchFormProps = {
  formProps: React.ComponentProps<'form'>;
  inputProps: React.ComponentProps<'input'>;
  buttonProps: React.ComponentProps<'button'>;
};

export function WeatherSearchForm({
  formProps,
  inputProps,
  buttonProps,
}: WeatherSearchFormProps) {
  return (
    <form {...formProps}>
      <input {...inputProps} />
      <button {...buttonProps} />
    </form>
  );
}
```

```tsx
// ✅ GOOD — explicit contract
type WeatherSearchFormProps = {
  city: string;
  status: WeatherStatus;
  errorMessage: string;
  onCityChange: (value: string) => void;
  onSearch: (city: string) => void;
  onUseLocation: () => void;
};

export function WeatherSearchForm({
  city,
  status,
  errorMessage,
  onCityChange,
  onSearch,
  onUseLocation,
}: WeatherSearchFormProps) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSearch(city); }}>
      <WeatherCityField city={city} onCityChange={onCityChange} />
      <Button disabled={status === 'loading'} type="submit">Search</Button>
      <Button type="button" variant="outline" onClick={onUseLocation}>
        Use my location
      </Button>
      {errorMessage.length > 0 && <WeatherErrorAlert message={errorMessage} />}
    </form>
  );
}
```

## Forwarding unknown props through a wrapper

```tsx
// ❌ BAD — wrapper passes everything downstream
type CardProps = React.ComponentProps<'div'> & {
  title: string;
};

export function Card({ title, ...rest }: CardProps) {
  return (
    <div {...rest}>
      <h3>{title}</h3>
    </div>
  );
}
```

```tsx
// ✅ GOOD — only the props the wrapper actually uses
type CardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-5', className)}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

## Mapping collections with spread

```tsx
// ❌ BAD — spreads each item into the child
export function WeatherMetricsGrid({ metrics }: WeatherMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <WeatherMetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
```

```tsx
// ✅ GOOD — pass known fields explicitly
export function WeatherMetricsGrid({ metrics }: WeatherMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <WeatherMetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          unit={metric.unit}
        />
      ))}
    </div>
  );
}
```
