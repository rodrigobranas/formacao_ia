# React Standards

These standards apply to all React code in `frontend/` (React + TypeScript + Vite). Agents and contributors must follow them when writing or reviewing components, pages, and hooks.

See also: [code-standards.md](./code-standards.md) and [folder-structure.md](./folder-structure.md).

## 1. Use functional components only

Do not use class components. Prefer named function exports.

```tsx
// ❌ BAD
class HomePage extends React.Component {
  render() {
    return <h1>IA para Devs</h1>
  }
}

// ✅ GOOD
export function HomePage() {
  return <h1>IA para Devs</h1>
}
```

## 2. Components must have at most 30 lines

Keep components focused. Extract subcomponents, hooks, or helpers when JSX or logic grows.

```tsx
// ❌ BAD — page with fetch logic, state, and large JSX in one component
export function HomePage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  useEffect(() => {
    const checkStatus = async () => { /* ... */ }
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div>
      {/* many nested elements and inline logic */}
    </div>
  )
}

// ✅ GOOD — small page composes hook + component
export function HomePage() {
  const apiStatus = useApiStatus()

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <h1 className="text-6xl font-bold">IA para Devs</h1>
      <ApiStatusIndicator status={apiStatus} />
    </div>
  )
}
```

## 3. Pass props explicitly — no spread operator

List each prop by name. Avoid `{...props}` and `{...rest}` when rendering child components.

```tsx
// ❌ BAD
type ButtonGroupProps = {
  primaryProps: ButtonProps
  secondaryProps: ButtonProps
}

export function ButtonGroup({ primaryProps, secondaryProps }: ButtonGroupProps) {
  return (
    <div>
      <Button {...primaryProps} />
      <Button {...secondaryProps} />
    </div>
  )
}

// ✅ GOOD
type ButtonGroupProps = {
  primaryLabel: string
  secondaryLabel: string
  onPrimaryClick: () => void
  onSecondaryClick: () => void
}

export function ButtonGroup({
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
}: ButtonGroupProps) {
  return (
    <div>
      <Button label={primaryLabel} onClick={onPrimaryClick} />
      <Button label={secondaryLabel} onClick={onSecondaryClick} />
    </div>
  )
}
```

## 4. Custom hooks must start with `use`

Hook names must use the `use` prefix so React and linters can enforce the Rules of Hooks.

```tsx
// ❌ BAD
export function apiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>('checking')
  // ...
  return status
}

// ✅ GOOD
export function useApiStatus(): ApiStatus {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  // ...
  return apiStatus
}
```

## 5. Always use `useMemo` for derived values

Memoize computed values, filtered lists, mapped data, and derived class names to avoid unnecessary recalculations and child re-renders.

```tsx
// ❌ BAD — recomputed on every render
export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-500'
  const label = status === 'online' ? 'Online' : 'Offline'

  return <div className={colorClass}>{label}</div>
}

// ✅ GOOD — derived values wrapped in useMemo
export function ApiStatusIndicator({ status }: ApiStatusIndicatorProps) {
  const colorClass = useMemo(
    () => STATUS_COLORS[status] ?? 'bg-gray-500',
    [status],
  )

  const label = useMemo(() => {
    if (status === 'online') {
      return 'Online'
    }

    return 'Offline'
  }, [status])

  return <div className={colorClass}>{label}</div>
}
```

```tsx
// ❌ BAD
export function UserList({ users }: UserListProps) {
  const activeUsers = users.filter((user) => user.isActive)

  return (
    <ul>
      {activeUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// ✅ GOOD
export function UserList({ users }: UserListProps) {
  const activeUsers = useMemo(
    () => users.filter((user) => user.isActive),
    [users],
  )

  return (
    <ul>
      {activeUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Summary checklist

Before submitting React code, verify:

- [ ] Components are functional (no class components)
- [ ] No component exceeds 30 lines
- [ ] Props are passed explicitly (no spread operator on child components)
- [ ] Custom hooks are named with the `use` prefix
- [ ] Derived values use `useMemo` with correct dependency arrays
