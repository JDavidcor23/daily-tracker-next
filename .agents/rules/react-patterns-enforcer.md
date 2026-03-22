---
name: react-patterns-enforcer
description: Enforces separation of concerns, correct Context usage, and proper Provider placement in React
activation: always-on
glob: "**/*.{tsx,jsx,ts}"
---

## Separation of layers

| Layer | Responsibility |
|-------|---------------|
| Component | UI and rendering only — no business logic |
| Hook | All state and business logic |
| Service | API calls and external integrations |

```tsx
// Component — presentational only
export const MyComponent = ({ prop1 }: Props) => {
  const { state, handleAction } = useMyComponent(prop1)
  return <div>{/* JSX only */}</div>
}

// Hook — all logic lives here
export const useMyComponent = (initialValue: string) => {
  const [state, setState] = useState(initialValue)
  const handleAction = () => { /* logic */ }
  return { state, handleAction }
}
```

## Props drilling

- 1–2 levels → pass props directly, OK
- 3+ levels → use Context

```tsx
// BAD — 3+ levels
<GrandParent user={user}><Parent user={user}><Child user={user}><GrandChild user={user} /></Child></Parent></GrandParent>

// GOOD — Context
<UserContext.Provider value={user}>
  <GrandParent><Parent><Child><GrandChild /></Child></Parent></GrandParent>
</UserContext.Provider>
```

## Provider placement

Place Providers as close as possible to where they are consumed — not at the app root unless the data is truly global.

```tsx
// BAD — wraps unrelated routes
<UserProvider>
  <Route path="/users" element={<Users />} />
  <Route path="/products" element={<Products />} />
</UserProvider>

// GOOD — scoped to the feature
<UserProvider>
  <UserTable />
  <UserForm />
</UserProvider>
```

## Provider + Hook pattern

Always pair a Context Provider with a custom hook that guards against usage outside the Provider:

```tsx
// UserProvider.tsx
const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}

// useUser.hook.ts
export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
```

## Import order

```ts
// 1. React and external libraries
// 2. Internal components
// 3. Internal hooks
// 4. Services
// 5. Types
// 6. Constants
// 7. Styles
```
