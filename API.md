# 📚 API Documentation — Daily Tracker Next

This document provides a detailed overview of all the API endpoints available in the **Daily Tracker Next** application. All endpoints are served under the `/api` prefix and interact primarily with **Supabase**.

---

## 📅 Daily Logs (Unified Endpoint)
Used for retrieving and managing unified activity logs for the dashboard and history pages.

### `GET /api/logs`
**Query Parameters:**
- `date`: (Optional) Filter logs by a specific date (YYYY-MM-DD).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2024-03-22",
      "log_module": "nutrition | training | study | mind",
      "food_meals": "...",
      "created_at": "..."
    }
  ]
}
```

---

## ✅ Todos & Task Management
Manage task lists, recurring tasks, and their associated categories.

### `GET /api/todos`
Fetches all tasks, including their associated tags (joined from `todo_tags`).

### `POST /api/todos`
Creates a new task.
**Key Body Fields:**
- `text`: (String) Task title.
- `priority`: `low | medium | high`.
- `due_date`: `YYYY-MM-DD`.
- `is_repetitive`: (Boolean).
- `tagIds`: (Array of UUIDs) Tags to link.

### `PATCH /api/todos/[id]`
Updates an existing task. Handles removal/re-insertion of tag links automatically.

### `DELETE /api/todos/[id]`
Removes a task and its relationship records.

---

## 🏷️ Smart Tags
Manage categorization and visual labels for tasks.

### `GET /api/tags`
Fetches all available tags (id, name, color).

### `POST /api/tags`
Creates a new tag.
**Body:** `{ "name": "Work", "color": "#6366f1" }`

### `DELETE /api/tags/[id]`
Removes a tag system-wide.

---

## 📈 Specialized Data Modules
Endpoint for recording specific activity types.

### `POST /api/nutrition` | `POST /api/training` | `POST /api/study` | `POST /api/mind`
**Description:** Writes a new entry into the `daily_logs` table with the appropriate `log_module` type.

---

## 🎯 Goals & Productivity
Endpoints for long-term target tracking.

### `GET /api/goals`
Fetches all goals, milestones, and their linked tasks.

### `POST /api/goals` | `PATCH /api/goals/[id]`
CRUD operations for the `goals` table.

### `POST /api/milestones` | `DELETE /api/milestones/[id]`
Manage specific checkpoints within a goal.

---

## 💪 Fitness (Google Fit Sync)
Hardware and external service integration.

### `GET /api/google-fit/data`
Syncs and retrieves fitness data (steps, calories, sleep) for the requested `date`.

### `GET /api/google-fit/auth`
Starts the Google OAuth 2.0 flow for health data access.

---

## 📊 Analytics & Progress
Progress calculations and health snapshots.

### `GET /api/status/[period]`
Calculates progress metrics for a given period: `today | week | month`.
Returns aggregated data for nutrition, training, and task completion.
