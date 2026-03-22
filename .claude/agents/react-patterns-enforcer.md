---
name: React Patterns Enforcer
description: Apply when writing or reviewing React components, hooks, or context providers. Enforces separation of concerns, correct Context usage, and proper Provider placement.
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
// App.tsx
<UserProvider>
  <Route path="/users" element={<Users />} />
  <Route path="/products" element={<Products />} />  {/* doesn't need UserProvider */}
</UserProvider>

// GOOD — scoped to the feature
// UsersFeature.tsx
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
import React from 'react'
import { something } from 'external-lib'

// 2. Internal components
import { MyComponent } from './components'

// 3. Internal hooks
import { useFeature } from './hooks'

// 4. Services
import { featureService } from './services'

// 5. Types
import type { FeatureTypes } from './types'

// 6. Constants
import { FEATURE_CONSTANTS } from './constants'

// 7. Styles
import './styles/Feature.css'
```
