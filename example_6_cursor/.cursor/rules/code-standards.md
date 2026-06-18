# Code Standards

These standards apply to all code in `example_6_cursor` (backend Express + TypeScript, frontend React + TypeScript). Agents and contributors must follow them when writing or reviewing code.

## 1. Write all code in English

Use English for identifiers, comments, commit messages, and user-facing API messages.

```typescript
// ❌ BAD
const statusDaApi = 'online'
// retorna o status da api

// ✅ GOOD
const apiStatus = 'online'
// returns the current API status
```

## 2. Methods must have at most 30 lines

Keep functions focused. Extract helpers when logic grows.

```typescript
// ❌ BAD — handler does too much in one function
app.get('/health', async (req, res) => {
  const start = Date.now()
  const dbOk = await checkDatabase()
  const cacheOk = await checkCache()
  const diskOk = await checkDiskSpace()
  // ... many more lines of reporting, formatting, logging ...
  res.json({ status: 'healthy', checks: { dbOk, cacheOk, diskOk }, duration: Date.now() - start })
})

// ✅ GOOD — small, single-purpose functions
async function buildHealthReport() {
  const checks = await runHealthChecks()
  return { status: 'healthy', checks, timestamp: new Date().toISOString() }
}

app.get('/health', async (_req, res) => {
  const report = await buildHealthReport()
  res.json(report)
})
```

## 3. Avoid more than 3 parameters

Prefer objects or small types when you need more data.

```typescript
// ❌ BAD
function createUser(name: string, email: string, role: string, department: string) {
  // ...
}

// ✅ GOOD
type CreateUserInput = {
  name: string
  email: string
  role: string
}

function createUser(input: CreateUserInput) {
  // ...
}
```

## 4. Do not nest if/else beyond 2 levels

Use early returns, guard clauses, or extracted functions instead of deep nesting.

```typescript
// ❌ BAD
function resolveApiStatus(response: Response) {
  if (response) {
    if (response.ok) {
      if (response.status === 200) {
        return 'online'
      } else {
        return 'offline'
      }
    } else {
      return 'offline'
    }
  } else {
    return 'offline'
  }
}

// ✅ GOOD
function resolveApiStatus(response: Response): ApiStatus {
  if (!response.ok) {
    return 'offline'
  }

  return 'online'
}
```

## 5. Avoid switch/case

Prefer maps, lookup objects, or polymorphism.

```typescript
// ❌ BAD
function getStatusColor(status: ApiStatus) {
  switch (status) {
    case 'online':
      return 'bg-green-500'
    case 'offline':
      return 'bg-red-500'
    case 'checking':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

// ✅ GOOD
const STATUS_COLORS: Record<ApiStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-red-500',
  checking: 'bg-yellow-500',
}

function getStatusColor(status: ApiStatus) {
  return STATUS_COLORS[status] ?? 'bg-gray-500'
}
```

## 6. Methods and functions must start with a verb

Names should describe an action.

```typescript
// ❌ BAD
function apiStatus() { /* ... */ }
function healthReport() { /* ... */ }

// ✅ GOOD
function fetchApiStatus() { /* ... */ }
function buildHealthReport() { /* ... */ }
function checkApiHealth() { /* ... */ }
```

## 7. Use clear, objective variable names

Avoid abbreviations, single letters (except loop indices), and vague names.

```typescript
// ❌ BAD
const d = new Date()
const tmp = await fetch(url)
const x = tmp.ok

// ✅ GOOD
const timestamp = new Date().toISOString()
const healthResponse = await fetch('http://localhost:3000/health')
const isApiHealthy = healthResponse.ok
```

## 8. One type per file

Define each `type` or `interface` in its own file inside `types/` (see [folder-structure.md](./folder-structure.md)). File names should reflect the type name in kebab-case.

```typescript
// ❌ BAD — multiple types in types/api.ts
export type ApiStatus = 'checking' | 'online' | 'offline'

export type HealthResponse = {
  status: string
  timestamp: string
}

export type UserProfile = {
  id: string
  name: string
}

// ✅ GOOD — one type per file
// types/api-status.ts
export type ApiStatus = 'checking' | 'online' | 'offline'

// types/health-response.ts
export type HealthResponse = {
  status: string
  timestamp: string
}

// types/user-profile.ts
export type UserProfile = {
  id: string
  name: string
```

Import only the types you need:

```typescript
// ✅ GOOD
import type { ApiStatus } from '@/types/api-status'
import type { HealthResponse } from '@/types/health-response'
```

## Summary checklist

Before submitting code, verify:

- [ ] Identifiers and comments are in English
- [ ] No function exceeds 30 lines
- [ ] No function has more than 3 parameters
- [ ] If/else nesting is at most 2 levels
- [ ] No `switch/case` (use maps or early returns)
- [ ] Function names start with a verb
- [ ] Variable names are descriptive and unambiguous
- [ ] Each type or interface lives in its own file under `types/`
