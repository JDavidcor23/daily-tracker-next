# 📚 API Documentation — Daily Tracker Next

All endpoints are served under the `/api` prefix and interact with **Supabase**.

> **Schema note:** The database uses a normalized schema. Logs are split into `daily_log_entries` + module tables (`log_nutrition`, `log_training`, `log_study`, `log_mind`). Todos are split into `todo_templates` + `todo_instances`. All API responses are **flattened** to the same shape as before — no frontend changes required.

---

## 📅 Daily Logs

### `GET /api/logs`
Fetches log entries, joining all module tables and returning a flat `DailyLog` object per entry.

**Query Parameters:**
- `date` *(optional)* — Filter by date `YYYY-MM-DD`.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2026-03-22",
      "log_module": "nutrition | training | study | mind",
      "created_at": "...",
      "food_meals": "...",
      "food_notes": "...",
      "trained": false,
      "train_type": "...",
      "train_duration": "...",
      "train_notes": "...",
      "study_topic": "...",
      "study_time": "...",
      "study_notes": "...",
      "mood": "...",
      "stress_level": 5,
      "mind_title": "...",
      "mind_description": "...",
      "mind_notes": "..."
    }
  ]
}
```

### `PATCH /api/logs/[id]`
Updates a log entry. Fields are routed automatically to the correct module table (`log_nutrition`, `log_training`, etc.) based on the entry's `log_module`. `date` is updated on `daily_log_entries`. Returns the full flattened entry.

**Do not include** `id`, `created_at`, or `log_module` in the body.

### `DELETE /api/logs/[id]`
Deletes the `daily_log_entries` row. Module table rows are removed automatically via `ON DELETE CASCADE`.

---

## 📈 Specialized Log Modules

Each endpoint creates a `daily_log_entries` anchor row with the appropriate `log_module`, then inserts into the corresponding module table. Returns a flattened log object.

### `POST /api/nutrition`
**Body:** `{ "food_meals": "...", "food_notes": "...", "date": "YYYY-MM-DD" }`
Writes to `log_nutrition`.

### `POST /api/training`
**Body:** `{ "trained": true, "train_type": "...", "train_duration": "...", "train_notes": "...", "date": "YYYY-MM-DD" }`
Writes to `log_training`.

### `POST /api/study`
**Body:** `{ "study_topic": "...", "study_time": "...", "study_notes": "...", "date": "YYYY-MM-DD" }`
Writes to `log_study`.

### `POST /api/mind`
**Body:** `{ "mood": "...", "stress_level": 5, "mind_title": "...", "mind_description": "...", "date": "YYYY-MM-DD" }`
Writes to `log_mind`.

---

## ✅ Todos & Task Management

Todos are stored as `todo_templates` (what the task is) + `todo_instances` (when / completion state). The API flattens them into the `Todo` shape, using `template_id` as the top-level `id`.

### `GET /api/todos`
Fetches all active templates, joining their latest instance and tags. Returns a flat `Todo[]` sorted by completion then creation date.

**Response shape per item:**
```json
{
  "id": "template_uuid",
  "text": "...",
  "description": "...",
  "priority": "low | medium | high",
  "due_date": "YYYY-MM-DD",
  "is_repetitive": false,
  "frequency": "daily | weekly | monthly",
  "created_at": "...",
  "completed": false,
  "date": "YYYY-MM-DD",
  "tags": [{ "id": "...", "name": "...", "color": "..." }]
}
```

### `POST /api/todos`
Creates a new `todo_templates` row and one `todo_instances` row.

**Body:**
```json
{
  "text": "Task title",
  "priority": "medium",
  "date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "description": "...",
  "completed": false,
  "is_repetitive": false,
  "frequency": "daily",
  "tagIds": ["uuid", "..."]
}
```

### `PATCH /api/todos/[id]`
Updates a template by its `template_id`. Template fields (`text`, `description`, `priority`, `due_date`, `is_repetitive`, `frequency`) update `todo_templates`. Instance fields (`completed`) update the most recent `todo_instances` row. Tag links are replaced if `tagIds` is provided.

### `DELETE /api/todos/[id]`
Deletes the `todo_templates` row. Instances and tag links are removed via `ON DELETE CASCADE`.

---

## 🏷️ Smart Tags

### `GET /api/tags`
Returns all tags `{ id, name, color }`.

### `POST /api/tags`
**Body:** `{ "name": "Work", "color": "#6366f1" }`

### `PATCH /api/tags/[id]`
Updates a tag's name or color.

### `DELETE /api/tags/[id]`
Removes the tag and all `todo_tags` links via cascade.

---

## 🎯 Goals & Productivity

### `GET /api/goals`
Returns all goals with milestone summaries.

### `POST /api/goals`
Creates a new goal. **Body:** `{ "title", "life_area", "description", "due_date", "status", "progress" }`.

### `PATCH /api/goals/[id]`
Updates goal fields or `progress`.

### `DELETE /api/goals/[id]`
Deletes the goal, milestones, and task links via cascade.

### `GET /api/goals/[id]/details`
Returns a goal with full milestone list and `linkedTodos` (flattened `Todo[]` joined from `goal_task_links → todo_templates + todo_instances`).

### `POST /api/milestones`
**Body:** `{ "goal_id", "title", "due_date", "completed", "order_index" }`.

### `PATCH /api/milestones/[id]`
Updates a milestone (typically toggling `completed`).

### `DELETE /api/milestones/[id]`
Removes a milestone.

### `POST /api/goal-task-links`
Links a todo template to a goal.
**Body:** `{ "goal_id": "uuid", "todo_id": "template_uuid" }`
Inserts into `goal_task_links` using `template_id` column.

### `DELETE /api/goal-task-links`
Removes a goal–task link.
**Body:** `{ "goal_id": "uuid", "todo_id": "template_uuid" }`

---

## 💪 Fitness (Google Fit)

### `GET /api/google-fit/status`
Returns `{ connected: boolean, configured: boolean }`.

### `GET /api/google-fit/auth-url`
Returns the OAuth 2.0 authorization URL to start the Google Fit connection flow.

### `GET /api/google-fit/callback`
OAuth callback handler. Stores tokens in `app_settings`.

### `GET /api/google-fit/data`
**Query:** `?period=today|week|month`
Returns aggregated fitness data `{ steps, calories, distance, activeMinutes, sleepMinutes }`.

### `POST /api/google-fit/disconnect`
Revokes tokens and removes them from `app_settings`.

---

## 📊 Status & Reports

### `GET /api/status/[period]`
**Path:** `today | week | month`
**Query:** `?localDate=YYYY-MM-DD&module=nutrition|training|study|mind`

Returns flattened logs and todos for the period. Used by the PDF report generator.

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "range": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
    "logs": [ ...DailyLog[] ],
    "todos": [ ...Todo[] ]
  }
}
```

---

## 🗄️ Database Schema (Normalized)

| Layer | Tables |
|-------|--------|
| Logs | `daily_log_entries`, `log_nutrition`, `log_training`, `log_study`, `log_mind` |
| Todos | `todo_templates`, `todo_instances`, `todo_tags` |
| Goals | `goals`, `milestones`, `goal_task_links` |
| Tags | `tags` |
| Settings | `app_settings` |

All API responses flatten the normalized tables back into the original `DailyLog` / `Todo` shapes so UI components require no changes.
