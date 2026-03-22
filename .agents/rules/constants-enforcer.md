---
name: constants-enforcer
description: Enforces named constants instead of magic numbers or magic strings
activation: always-on
---

Never use magic numbers or magic strings directly in code. Always extract them into named constants.

## Strings

Define string literals used as state values, view names, or status identifiers as object constants.

```ts
// constants/VIEWS.ts
export const VIEWS = {
  TABLE: 'table',
  ASSIGN_BRAND: 'assign-brand',
  ASSIGN_ROLE: 'assign-role',
}

// constants/STATUS.ts
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
}
```

## Numbers

Define numeric literals used as limits, timeouts, rates, or thresholds as named constants.

```ts
// constants/validation.constants.ts
export const PASSWORD_LIMITS = { MIN_LENGTH: 8, MAX_LENGTH: 50 }

// constants/timing.constants.ts
export const REFRESH_INTERVAL_MS = 5000

// constants/pricing.constants.ts
export const DISCOUNT_RATE = 0.15
```

## Naming

| Element | Convention |
|---------|-----------|
| File | `camelCase.constants.ts` or `UPPER_CASE.ts` |
| Primitive constant | `UPPER_SNAKE_CASE` |
| Object of constants | `PascalCase` |

## Placement by scope

```
src/constants/                                      # global
src/features/feature-name/constants/                # feature
src/features/feature-name/components/Comp/constants/ # component
```

## Allowed exceptions

- Array indices: `array[0]`
- Trivial init: `useState(0)`, `useState('')`, `useState([])`
- Basic arithmetic: `index + 1`, `total * 2`
- Zero/one comparisons: `if (count === 0)`
