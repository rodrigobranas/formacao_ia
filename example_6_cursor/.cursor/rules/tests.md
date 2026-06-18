# Testing Standards

Every feature, bug fix, or behavior change in `example_6_cursor` **must** include automated tests using [Vitest](https://vitest.dev/). Agents and contributors must write tests before considering work complete.

See also: [code-standards.md](./code-standards.md), [folder-structure.md](./folder-structure.md), and [react.md](./react.md).

**Out of scope for now:** end-to-end (E2E) tests. Do not add Playwright, Cypress, or similar E2E suites unless explicitly requested.

## 1. Required test coverage

| Layer | Test type | What to test |
|-------|-----------|--------------|
| `services/` | Unit | Business rules, pure logic, error paths |
| `data/` | Unit | Mapping, retries, integration clients (with stubs) |
| `routes/` | Integration | HTTP status codes, request/response shape |
| `hooks/` | Unit | State transitions and side effects (with stubs) |
| `components/` | Unit | Rendering and user-visible behavior |
| `pages/` | Integration | Composition of hooks + components (with stubs) |

Run tests after every change:

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## 2. Unit tests vs integration tests

### Unit tests

Test a single module in isolation. Mock or stub all external dependencies.

```typescript
// backend/src/services/healthService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildHealthReport } from './healthService'

describe('buildHealthReport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns a healthy report with ISO timestamp', () => {
    // Arrange — (setup in beforeEach)

    // Act
    const report = buildHealthReport()

    // Assert
    expect(report.status).toBe('healthy')
    expect(report.timestamp).toBe('2026-06-18T12:00:00.000Z')
  })
})
```

### Integration tests

Test how modules work together (e.g. route → service). Still stub external systems (database, third-party APIs, clock).

```typescript
// backend/src/routes/health.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import healthRoutes from './health'

describe('GET /health', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 200 with health report JSON', async () => {
    // Arrange
    const app = express()
    app.use('/health', healthRoutes)

    // Act
    const response = await request(app).get('/health')

    // Assert
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'healthy',
      timestamp: '2026-06-18T12:00:00.000Z',
    })
  })
})
```

### Do not write E2E tests (for now)

```typescript
// ❌ BAD — browser E2E (out of scope)
test('user sees API status on homepage', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page.getByText('API Status')).toBeVisible()
})
```

Prefer unit and integration tests that run fast in CI without a browser or running servers.

## 3. Structure tests with Arrange / Act / Assert

Use **AAA** or **Given / When / Then** — both are equivalent. Keep the three phases visible in every test.

```typescript
// ✅ GOOD — Arrange / Act / Assert
it('returns null when fetch fails', async () => {
  // Arrange
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

  // Act
  const result = await fetchHealthStatus()

  // Assert
  expect(result).toBeNull()
})
```

```typescript
// ✅ GOOD — Given / When / Then
it('marks API as offline when response is not ok', async () => {
  // Given a failed health response
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

  // When fetching health status
  const result = await fetchHealthStatus()

  // Then it returns null
  expect(result).toBeNull()
})
```

```typescript
// ❌ BAD — unclear phases, multiple acts and asserts mixed together
it('health flow', async () => {
  const r = await fetchHealthStatus()
  expect(r).toBeNull()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => ({ status: 'healthy' }) }))
  const r2 = await fetchHealthStatus()
  expect(r2).not.toBeNull()
})
```

Split into **one behavior per test** with a descriptive name.

## 4. Tests must not depend on each other

Each test must run alone and in any order. Never rely on shared mutable state or execution order.

```typescript
// ❌ BAD — tests depend on execution order
let cachedUser: User | undefined

it('creates a user', () => {
  cachedUser = createUser({ name: 'Ana' })
  expect(cachedUser.id).toBeDefined()
})

it('updates the same user', () => {
  // fails if previous test did not run first
  updateUser(cachedUser!.id, { name: 'Bob' })
})
```

```typescript
// ✅ GOOD — independent tests, local setup per test
it('creates a user with a generated id', () => {
  const user = createUser({ name: 'Ana' })
  expect(user.id).toBeDefined()
})

it('updates a user name', () => {
  const user = createUser({ name: 'Ana' })
  const updated = updateUser(user.id, { name: 'Bob' })
  expect(updated.name).toBe('Bob')
})
```

Use `beforeEach` only for **fresh, isolated** setup — not to carry state across tests.

## 5. Stub external dependencies

Stub anything non-deterministic or outside the module under test: HTTP APIs, `Date`, `Math.random`, filesystem, environment-specific config.

```typescript
// ❌ BAD — real fetch, real clock; flaky and slow
it('returns health data', async () => {
  const result = await fetchHealthStatus()
  expect(result?.timestamp).toBeDefined()
})
```

```typescript
// ✅ GOOD — stub fetch and freeze time
it('returns parsed health response when API succeeds', async () => {
  // Arrange
  const healthPayload = { status: 'healthy', timestamp: '2026-06-18T12:00:00.000Z' }
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(healthPayload),
    }),
  )

  // Act
  const result = await fetchHealthStatus()

  // Assert
  expect(result).toEqual(healthPayload)
})
```

```typescript
// ✅ GOOD — stub Date in backend service tests
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})
```

Always restore stubs and timers in `afterEach` to avoid leaking into other tests.

## 6. File naming and location

Place test files next to the code they cover:

```
backend/src/services/healthService.ts
backend/src/services/healthService.test.ts

frontend/src/hooks/useApiStatus.ts
frontend/src/hooks/useApiStatus.test.ts
```

Naming conventions:

- Unit/integration test files: `*.test.ts` or `*.test.tsx`
- One `describe` block per module; one `it` per behavior
- Test names in English, describing expected behavior: `'returns null when fetch fails'`

## 7. React component and hook tests

Use `@testing-library/react` with Vitest for frontend tests. Stub services — do not call the real API.

```tsx
// ✅ GOOD — component unit test with stubbed props
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ApiStatusIndicator } from './ApiStatusIndicator'

describe('ApiStatusIndicator', () => {
  it('renders API Status label', () => {
    // Arrange & Act
    render(<ApiStatusIndicator status="online" />)

    // Assert
    expect(screen.getByText('API Status')).toBeInTheDocument()
  })
})
```

## Summary checklist

Before submitting code, verify:

- [ ] New or changed behavior has Vitest tests (unit and/or integration)
- [ ] No E2E tests were added
- [ ] Each test follows Arrange / Act / Assert (or Given / When / Then)
- [ ] Tests are independent and order-agnostic
- [ ] External APIs, dates, and non-deterministic deps are stubbed
- [ ] `npm test` passes in both `backend/` and `frontend/`
