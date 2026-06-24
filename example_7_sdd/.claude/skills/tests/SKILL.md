---
name: tests
description: Defines testing standards for the example_6_cursor full-stack project using Vitest and Playwright. Use when implementing features, fixing bugs, changing behavior, writing unit, integration, or E2E tests, or when the user asks about test coverage, AAA structure, stubbing dependencies, or Playwright.
---

# Testing Standards

Every feature, bug fix, or behavior change in `example_6_cursor` **must** include automated tests. Use **Vitest** for unit and integration tests; use **Playwright** for end-to-end (E2E) tests that exercise the full stack (frontend + backend).

See also: [code-standards](../code-standards/SKILL.md), AGENTS.md (folder structure), and [react](../react/SKILL.md).

## 1. Required test coverage

| Layer | Test type | What to test |
|-------|-----------|--------------|
| `services/` | Unit | Business rules, pure logic, error paths |
| `data/` | Unit | Mapping, retries, integration clients (with stubs) |
| `routes/` | Integration | HTTP status codes, request/response shape |
| `hooks/` | Unit | State transitions and side effects (with stubs) |
| `components/` | Unit | Rendering and user-visible behavior |
| `pages/` | Integration | Composition of hooks + components (with stubs) |
| `e2e/` | E2E | Critical user journeys across frontend + backend |

### Testing pyramid

- **Default:** unit and integration tests (fast, isolated, stubbed dependencies).
- **E2E:** add Playwright tests for **critical paths** — flows that only make sense with a real browser, running servers, and real HTTP between frontend and backend.
- Do **not** duplicate unit/integration coverage in E2E. One happy-path E2E per major user journey is enough; edge cases stay in Vitest.

Run tests after every change:

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E (requires Playwright setup — see section 8)
cd e2e && npm test
```

## 2. Unit tests vs integration tests vs E2E

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

### E2E tests (Playwright)

Test real user journeys in a browser with both servers running. No stubs for the app's own API — the frontend must talk to the real backend.

```typescript
// e2e/health-status.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Homepage API status', () => {
  test('shows healthy status when backend is up', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act & Assert — user-visible outcome
    await expect(page.getByRole('heading', { name: /api status/i })).toBeVisible()
    await expect(page.getByText(/healthy|online/i)).toBeVisible()
  })
})
```

```typescript
// ❌ BAD — E2E for logic already covered by unit tests
test('buildHealthReport returns ISO timestamp', async ({ page }) => {
  await page.goto('/')
  const timestamp = await page.evaluate(() => window.__healthTimestamp)
  expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
})

// ❌ BAD — stubbing fetch in E2E defeats the purpose
test('shows offline when API fails', async ({ page }) => {
  await page.route('**/health', (route) => route.fulfill({ status: 500 }))
  await page.goto('/')
  // ...
})
```

Prefer Vitest for error paths and edge cases; use E2E only for journeys that prove the system works end-to-end.

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

**In unit and integration tests**, stub the app's dependencies. **In E2E tests**, do not stub the app's own backend — only stub truly external third-party APIs when unavoidable.

```typescript
// ❌ BAD — real fetch, real clock; flaky and slow (unit test)
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

E2E tests live in a dedicated folder at the project root:

```
e2e/
├── package.json
├── playwright.config.ts
└── health-status.spec.ts
```

Naming conventions:

- Unit/integration test files: `*.test.ts` or `*.test.tsx`
- E2E test files: `*.spec.ts` (Playwright convention)
- One `describe` / `test.describe` block per module or journey; one `it` / `test` per behavior
- Test names in English, describing expected behavior: `'returns null when fetch fails'`, `'shows healthy status when backend is up'`

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

## 8. Playwright E2E setup and conventions

### When to add E2E tests

Add or update E2E tests when a feature introduces or changes a **critical user journey**, for example:

- First load of a page that fetches from the backend
- Form submission that persists data
- Navigation between routes with real API data
- Error states visible only when the full stack is running

Skip E2E when Vitest already covers the behavior in isolation.

### Project layout and setup

Create `e2e/` at the repo root (alongside `backend/` and `frontend/`):

```bash
mkdir -p e2e
cd e2e
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

`e2e/package.json` scripts:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed"
  }
}
```

### Playwright config

Use `webServer` to start backend and frontend automatically. Reuse running servers locally; always start fresh in CI.

```typescript
// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
```

Ports match AGENTS.md: backend `3000`, frontend `5173`.

### E2E best practices

- Prefer **role-based locators**: `getByRole`, `getByLabel`, `getByText`. Avoid CSS selectors tied to implementation.
- Use **auto-waiting assertions**: `await expect(locator).toBeVisible()` — not fixed `page.waitForTimeout()`.
- Keep tests **short and journey-focused** — one primary outcome per test.
- Use `test.beforeEach` for navigation setup shared within a describe block.
- Tag slow or optional suites with `@slow` and run selectively: `npx playwright test --grep @slow`.

```typescript
// ✅ GOOD — resilient locators, clear AAA
test('user sees weather panel after page load', async ({ page }) => {
  // Arrange
  await page.goto('/')

  // Act
  const panel = page.getByRole('region', { name: /weather/i })

  // Assert
  await expect(panel).toBeVisible()
  await expect(panel.getByText(/°/)).toBeVisible()
})
```

```typescript
// ❌ BAD — brittle selector, arbitrary wait
test('weather panel', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(3000)
  await expect(page.locator('.weather-panel > div:nth-child(2)')).toBeVisible()
})
```

### Running E2E locally

With servers already running (`backend` on 3000, `frontend` on 5173), Playwright reuses them via `reuseExistingServer`.

```bash
cd e2e && npm test
cd e2e && npm run test:ui      # interactive debugger
cd e2e && npm run test:headed  # visible browser
```

For PR screenshots (not test assertions), see [finalize-implementation](../finalize-implementation/SKILL.md).

## Summary checklist

Before submitting code, verify:

- [ ] New or changed behavior has Vitest tests (unit and/or integration)
- [ ] Critical user journeys have Playwright E2E tests when the flow spans frontend + backend
- [ ] Each test follows Arrange / Act / Assert (or Given / When / Then)
- [ ] Tests are independent and order-agnostic
- [ ] Unit/integration tests stub external APIs, dates, and non-deterministic deps
- [ ] E2E tests use real backend — no stubbing the app's own API
- [ ] `npm test` passes in `backend/`, `frontend/`, and `e2e/` (when E2E applies)
