# Folder Structure

These conventions define where code belongs in `example_6_cursor`. Agents and contributors must follow this layout when adding or moving files in `backend/` and `frontend/`.

## Backend (`backend/src/`)

```
backend/src/
├── index.ts          # App bootstrap, middleware, route registration
├── routes/           # HTTP layer — request/response only
├── services/         # Business rules and orchestration
├── data/             # Database, external APIs, and integrations
└── types/            # Shared TypeScript types and interfaces
```

### Layer responsibilities

| Folder | Responsibility | Must NOT contain |
|--------|----------------|------------------|
| `routes/` | Parse HTTP input, call services, send HTTP responses | Business rules, SQL, fetch to external APIs |
| `services/` | Business logic, validation, orchestration | Express `req`/`res`, raw SQL, HTTP client calls |
| `data/` | Persistence and external integrations | HTTP handlers, business decisions |
| `types/` | Domain and API type definitions | Runtime logic or side effects |

### Dependency direction

```
routes  →  services  →  data
              ↓
           types  (imported by all layers)
```

Lower layers must not import from upper layers.

### Examples

#### Routes — HTTP only

```typescript
// ❌ BAD — business logic and timestamp formatting in the route
router.get('/', (_req, res) => {
  const hour = new Date().getHours()
  const status = hour < 18 ? 'healthy' : 'maintenance'
  res.json({ status, timestamp: new Date().toISOString() })
})

// ✅ GOOD — route delegates to the service
router.get('/', (_req, res) => {
  const report = buildHealthReport()
  res.json(report)
})
```

#### Services — business rules

```typescript
// ❌ BAD — service calls Express response objects
export function buildHealthReport(res: Response) {
  res.json({ status: 'healthy' })
}

// ✅ GOOD — service returns domain data
export function buildHealthReport(): HealthReport {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }
}
```

#### Data — database and external APIs

```typescript
// ❌ BAD — HTTP handler inside data layer
export function getHealthRoute(req: Request, res: Response) {
  res.json({ status: 'healthy' })
}

// ✅ GOOD — data layer wraps an external integration
export async function fetchWeatherFromApi(city: string): Promise<WeatherData> {
  const response = await fetch(`https://api.example.com/weather?city=${city}`)
  return response.json()
}
```

#### Types — shared definitions

```typescript
// ✅ GOOD
export type HealthReport = {
  status: 'healthy' | 'unhealthy'
  timestamp: string
}
```

---

## Frontend (`frontend/src/`)

```
frontend/src/
├── main.tsx          # React entry point
├── App.tsx           # Root component — routing and global layout
├── pages/            # Route-level screens
├── components/       # Reusable UI (feature + ui/ for shadcn)
├── hooks/            # Custom React hooks
├── services/         # API calls and external client logic
├── types/            # Shared TypeScript types
├── lib/              # Generic utilities (e.g. cn helper)
└── assets/           # Static assets (images, icons)
```

### Layer responsibilities

| Folder | Responsibility | Must NOT contain |
|--------|----------------|------------------|
| `pages/` | Full screens wired to hooks and components | Low-level fetch logic, generic UI primitives |
| `components/` | Presentational and reusable UI | Direct API calls, page-level routing |
| `hooks/` | Stateful UI logic, effects, derived state | JSX markup, raw fetch URLs |
| `services/` | HTTP requests and API response mapping | React hooks or components |
| `types/` | Shared frontend types | Components or runtime logic |
| `lib/` | Framework-agnostic helpers | Feature-specific business rules |

### Dependency direction

```
pages  →  hooks  →  services  →  (backend API)
   ↓        ↓
components  types
```

### Examples

#### Pages — screen composition

```typescript
// ❌ BAD — page fetches API and renders inline switch logic
export function HomePage() {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    fetch('http://localhost:3000/health').then(/* ... */)
  }, [])
  // ... large JSX with business logic ...
}

// ✅ GOOD — page composes hook + component
export function HomePage() {
  const apiStatus = useApiStatus()
  return (
    <div className="min-h-screen">
      <h1>IA para Devs</h1>
      <ApiStatusIndicator status={apiStatus} />
    </div>
  )
}
```

#### Hooks — UI state and effects

```typescript
// ✅ GOOD
export function useApiStatus() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    const checkStatus = async () => {
      const health = await fetchHealthStatus()
      setApiStatus(health ? 'online' : 'offline')
    }
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return apiStatus
}
```

#### Services — API access

```typescript
// ❌ BAD — service uses React hooks
export function useHealthService() {
  const [data, setData] = useState(null)
  // ...
}

// ✅ GOOD — plain async function
export async function fetchHealthStatus(): Promise<HealthResponse | null> {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) {
    return null
  }
  return response.json()
}
```

#### Components — presentation only

```typescript
// ✅ GOOD — receives data via props, no fetch
type ApiStatusIndicatorProps = {
  status: ApiStatus
}

export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-500'
  return <div className={`w-3 h-3 rounded-full ${colorClass}`} />
}
```

---

## File naming

- Use **kebab-case** for file names: `health-service.ts`, `api-status-indicator.tsx`
- Match export name to file purpose: `healthService.ts` → `buildHealthReport`, `useApiStatus.ts` → `useApiStatus`
- One main export per file when possible

## Summary checklist

Before adding a file, verify:

- [ ] File is in the correct layer (`routes`, `services`, `data`, or `types` on backend)
- [ ] File is in the correct layer (`pages`, `components`, `hooks`, `services`, or `types` on frontend)
- [ ] Dependencies flow downward (no `data/` importing from `routes/`)
- [ ] HTTP handling stays in `routes/` (backend) or `services/` (frontend)
- [ ] Business rules stay in `services/` (both backend and frontend orchestration)
- [ ] Types live in `types/`, not duplicated across layers
