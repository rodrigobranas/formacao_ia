# Functional components only

Use named function exports. Do not use class components or anonymous default exports for pages and components.

## Class component

```tsx
// ❌ BAD — class component
import React from 'react';

class HomePage extends React.Component {
  render() {
    return <h1>IA para Devs</h1>;
  }
}

export default HomePage;
```

```tsx
// ✅ GOOD — named function export
export function HomePage() {
  return <h1>IA para Devs</h1>;
}
```

## Anonymous default export

```tsx
// ❌ BAD — anonymous component, harder to trace in DevTools and stack traces
export default function () {
  return <ApiStatusIndicator status="online" />;
}
```

```tsx
// ✅ GOOD — named export matches file purpose
type ApiStatusIndicatorProps = {
  status: ApiStatus;
};

export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  // ...
}
```

## HOC or render props when a hook suffices

```tsx
// ❌ BAD — render-prop wrapper for data that belongs in a hook
type WithApiStatusProps = {
  children: (status: ApiStatus) => React.ReactNode;
};

export function WithApiStatus({ children }: WithApiStatusProps) {
  const [status, setStatus] = useState<ApiStatus>('checking');
  // fetch logic...
  return <>{children(status)}</>;
}

// usage
<WithApiStatus>{(status) => <ApiStatusIndicator status={status} />}</WithApiStatus>
```

```tsx
// ✅ GOOD — custom hook + small presentational component
export function HomePage() {
  const apiStatus = useApiStatus();

  return <ApiStatusIndicator status={apiStatus} />;
}
```
