---
name: file-structure-enforcer
description: Enforces folder structure, naming conventions, and barrel exports for all new files and features
activation: always-on
---

Every new file or feature must follow the project's folder structure and naming conventions.

## New component

1. Create folder `ComponentName/` (PascalCase)
2. Create `ComponentName.tsx` inside
3. If it needs logic → `hooks/useComponentName.hook.ts`
4. If it needs styles → `ComponentName.css`
5. Export from the nearest `index.ts`

## New feature

```
src/features/feature-name/
├── FeatureName.tsx
├── components/
├── hooks/
├── services/
├── types/
├── constants/
└── styles/
```

Feature folder names must be **kebab-case action-nouns** (`create-user`, `edit-profile`, `generate-report`).
Not: `user/`, `profile/`, `report/`.

## Naming conventions

| Type | Convention | Example |
|------|-----------|---------|
| Feature folder | kebab-case | `create-user` |
| Component | PascalCase | `UserTable.tsx` |
| Hook | camelCase + `.hook.ts` | `useUserTable.hook.ts` |
| Service | camelCase + `.service.ts` | `userManagement.service.ts` |
| Types | PascalCase + `.types.ts` | `UserTable.types.ts` |
| Constants | camelCase + `.constants.ts` | `validation.constants.ts` |

## Barrel exports

Every folder must have an `index.ts` that re-exports its contents:

```ts
// components/index.ts
export { UserTable } from './UserTable/UserTable'

// hooks/index.ts
export { useUserTable } from './useUserTable.hook'

// services/index.ts
export { userService } from './user.service'
```

## Import paths by context

| Resource | Path |
|----------|------|
| Hook of component | `./hooks/useHookName.hook` |
| Hook of feature | `../hooks/useHookName.hook` |
| Component of feature | `./components/ComponentName` |
| Service of feature | `./services/serviceName.service` |
