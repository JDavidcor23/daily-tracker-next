# Goals Section — Implementation Plan

## Context
Adding a Goals section to the Daily Tracker app. Users need to track life goals across four areas (Professional, Body Health, Mental Health, Financial) with milestone roadmaps, progress tracking, and task linking to existing todos. The feature requires a new DB schema, API routes, hook, components, and page — all following the existing project patterns.

---

## SQL Schema (run in Supabase SQL editor first)

```sql
create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  life_area   text not null check (life_area in ('profesional', 'salud_cuerpo', 'salud_mental', 'financiero')),
  description text,
  due_date    date not null,
  status      text not null default 'active' check (status in ('active', 'completed', 'paused')),
  progress    integer not null default 0 check (progress >= 0 and progress <= 100),
  created_at  timestamptz not null default now()
);

create table public.milestones (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references public.goals(id) on delete cascade,
  title       text not null,
  description text,
  due_date    date not null,
  completed   boolean not null default false,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.goal_task_links (
  id       uuid primary key default gen_random_uuid(),
  goal_id  uuid not null references public.goals(id) on delete cascade,
  todo_id  uuid not null references public.todos(id) on delete cascade,
  constraint goal_task_links_unique unique (goal_id, todo_id)
);

create index milestones_goal_id_idx on public.milestones(goal_id);
create index goal_task_links_goal_id_idx on public.goal_task_links(goal_id);
create index goal_task_links_todo_id_idx on public.goal_task_links(todo_id);
```

---

## Implementation Order

### Step 1 — Types (`src/lib/types.ts`)
Add after `Todo` interface:
```ts
export type GoalLifeArea = 'profesional' | 'salud_cuerpo' | 'salud_mental' | 'financiero';
export type GoalStatus   = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  title: string;
  life_area: GoalLifeArea;
  description?: string;
  due_date: string;
  status: GoalStatus;
  progress: number;
  created_at?: string;
}

export interface GoalSummary extends Goal {
  milestones: Pick<Milestone, 'id' | 'completed'>[];
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  order_index: number;
  created_at?: string;
}

export interface GoalTaskLink {
  id: string;
  goal_id: string;
  todo_id: string;
}

export interface GoalWithDetails extends Goal {
  milestones: Milestone[];
  linkedTodos: Todo[];
}
```

### Step 2 — Constants (`src/lib/constants.ts`)
Add:
```ts
export const GOAL_PROGRESS_MIN = 0;
export const GOAL_PROGRESS_MAX = 100;
export const GOAL_COMPLETION_SUGGEST_DURATION_MS = 5000;
export const GOAL_TITLE_PREVIEW_LENGTH = 60;

export const LIFE_AREA_LABELS: Record<string, string> = {
  profesional: 'Professional', salud_cuerpo: 'Body Health',
  salud_mental: 'Mental Health', financiero: 'Financial',
};

export const LIFE_AREA_META: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  profesional:  { bg: 'bg-blue-50 dark:bg-blue-950/20',       text: 'text-blue-600 dark:text-blue-400',       border: 'border-blue-100 dark:border-blue-900/30',       icon: '💼' },
  salud_cuerpo: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30', icon: '💪' },
  salud_mental: { bg: 'bg-violet-50 dark:bg-violet-950/20',   text: 'text-violet-600 dark:text-violet-400',   border: 'border-violet-100 dark:border-violet-900/30',   icon: '🧠' },
  financiero:   { bg: 'bg-amber-50 dark:bg-amber-950/20',     text: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-100 dark:border-amber-900/30',     icon: '💰' },
};

export const GOAL_STATUS_LABELS: Record<string, string> = {
  active: 'Active', completed: 'Completed', paused: 'Paused',
};

export const GOAL_STATUS_COLORS: Record<string, string> = {
  active:    'bg-brand-50 text-brand-600 dark:bg-brand-900/10 dark:text-brand-400',
  completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
  paused:    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};
```

### Step 3 — API Routes (6 new files)

| File | Methods | Supabase query |
|------|---------|----------------|
| `src/app/api/goals/route.ts` | GET, POST | `.select('*, milestones(id,completed)')` + insert |
| `src/app/api/goals/[id]/route.ts` | PATCH, DELETE | update/delete by id |
| `src/app/api/goals/[id]/details/route.ts` | GET | `Promise.all` of goal + milestones + `goal_task_links(*, todos(*))` |
| `src/app/api/milestones/route.ts` | POST | insert |
| `src/app/api/milestones/[id]/route.ts` | PATCH, DELETE | update/delete by id |
| `src/app/api/goal-task-links/route.ts` | POST, DELETE | insert / delete by goal_id+todo_id |

All routes use `import supabase from '@/lib/supabase'` (default export, env-var client).
All `[id]` params use `const { id } = await params` (Next.js 16 async params).
All return `{ success: boolean, data: T | null, error?: string }`.

### Step 4 — API Client (`src/lib/api.ts`)
Add to the `api` object (add types to import):
```ts
goals: {
  fetch: () => request<GoalSummary[]>('/api/goals'),
  create: (goal: Omit<Goal, 'id' | 'created_at'>) => request<Goal>('/api/goals', { method: 'POST', body: JSON.stringify(goal) }),
  update: (id: string, updates: Partial<Goal>) => request<Goal>(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  delete: (id: string) => request<void>(`/api/goals/${id}`, { method: 'DELETE' }),
  getDetails: (id: string) => request<GoalWithDetails>(`/api/goals/${id}/details`),
},
milestones: {
  create: (m: Omit<Milestone, 'id' | 'created_at'>) => request<Milestone>('/api/milestones', { method: 'POST', body: JSON.stringify(m) }),
  update: (id: string, u: Partial<Milestone>) => request<Milestone>(`/api/milestones/${id}`, { method: 'PATCH', body: JSON.stringify(u) }),
  delete: (id: string) => request<void>(`/api/milestones/${id}`, { method: 'DELETE' }),
},
goalTaskLinks: {
  link: (goalId: string, todoId: string) => request<GoalTaskLink>('/api/goal-task-links', { method: 'POST', body: JSON.stringify({ goal_id: goalId, todo_id: todoId }) }),
  unlink: (goalId: string, todoId: string) => request<void>('/api/goal-task-links', { method: 'DELETE', body: JSON.stringify({ goal_id: goalId, todo_id: todoId }) }),
},
```

### Step 5 — Hook (`src/hooks/useGoals.ts`)
State: `goals: GoalSummary[]`, `loading`, `selectedGoal: GoalWithDetails | null`, `detailLoading`, `isFormOpen`, `editingGoal: Goal | null`, `allTodos: Todo[]`

Key logic:
- `fetchGoals` + `fetchTodos` run in `Promise.all` on mount
- `calculateProgress(milestones) = milestones.length === 0 ? 0 : Math.round(done/total * GOAL_PROGRESS_MAX)`
- `toggleMilestone`: optimistic update → PATCH milestone → recalculate progress → PATCH goal → if all done & not completed → auto-suggest toast
- `deleteMilestone`: delete → recalculate progress → PATCH goal
- Progress always persisted via `api.goals.update(id, { progress })`

### Step 6 — Components (4 new files)

**`src/components/goals/GoalCard.tsx`**
- Props: `goal: GoalSummary`, `onClick`, `onEdit`, `onDelete`
- Shows: life area icon+badge, title, status pill, due date, progress bar (`style={{ width: \`${progress}%\` }}`), `done/total milestones`
- Hover actions: edit + delete icon buttons (`group-hover:opacity-100`)

**`src/components/goals/GoalForm.tsx`**
- Props: `editingGoal: Goal | null`, `onSubmit(data)`, `onClose`
- Modal overlay, fields: title, life_area (select), description (textarea), due_date (required date input, `min=today`), status (select, edit mode only)
- Pre-populates via `useEffect` when `editingGoal` is set

**`src/components/goals/GoalDetailModal.tsx`**
- Props: `goal: GoalWithDetails`, `detailLoading`, `allTodos`, `onClose`, `onEdit`, `onToggleMilestone`, `onAddMilestone`, `onDeleteMilestone`, `onLinkTask`, `onUnlinkTask`, `onCompleteGoal`
- Sections: header, meta (due date + %), progress bar, milestones roadmap (checkbox list + inline add form), linked tasks (list + link dropdown)
- All-done banner triggers `onCompleteGoal`
- Modal content: `overflow-y-auto max-h-[80vh]`

**`src/components/goals/index.ts`** — barrel export

### Step 7 — Page (`src/app/goals/page.tsx`)
- `'use client'`, consumes `useGoals`
- Local state: `activeLifeArea: GoalLifeArea | 'all'`
- Life area tabs row
- `'all'` view: 4 sections grouped by area, each `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Filtered view: single grid for selected area
- Renders `GoalForm` and `GoalDetailModal` conditionally

### Step 8 — Navigation (`src/components/Layout.tsx`)
Add `{ to: '/goals', label: 'Goals', icon: '🎯' }` between Tasks and Settings in `NAV_ITEMS`.

---

## Critical Edge Cases

1. **Progress on milestone delete** — must recalculate + PATCH goal immediately
2. **Zero milestones** — guard in `calculateProgress` prevents divide-by-zero
3. **Auto-suggest, not auto-complete** — toast suggestion only; user clicks "Complete Goal" manually
4. **`allTodos` for linking** — fetched in `useGoals` alongside goals (not inside modal)
5. **Inline style for progress bar** — `style={{ width: \`${progress}%\` }}` is the only correct approach for dynamic % widths in Tailwind v4 (build-time tool cannot generate arbitrary values)
6. **Next.js 16 async params** — all `[id]` routes: `const { id } = await params`

---