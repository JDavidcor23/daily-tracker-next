# Daily Tracker Next

A personal health & productivity tracker built with **Next.js 16**, **Supabase**, and **Google Fit**.

Track your daily nutrition, training, study, mood, fitness, and tasks — all in one place.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase |
| Auth | Google OAuth (Google Fit integration) |
| Reports | jsPDF + autotable |
| Deployment | Vercel |

## Features

- **📊 Dashboard** — Today's snapshot of all modules
- **🏋️ Training** — Log workouts, sets, reps, weight
- **🥗 Nutrition** — Track meals and calories
- **📚 Study** — Log study sessions with duration
- **🧠 Mind** — Mood and mental wellness tracking
- **💪 Fitness** — Syncs with **Google Fit** (steps, active minutes, calories)
- **✅ Todos** — Task management with CRUD and **🔍 Real-time Search**
- **🏷️ Smart Tags** — Categorize tasks with custom names and vibrant colors
- **📥 Reports** — Download daily/weekly PDF reports via jsPDF
- **⚙️ Settings** — Suppabase connection & Google Fit integration management

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (training, nutrition, study, mind, todos, google-fit, logs, status)
│   ├── history/          # Historical data view
│   ├── settings/         # App settings page
│   ├── todos/            # Todos page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard
├── components/
│   ├── modules/          # Core feature modules (Nutrition, Training, Study, etc.)
│   ├── timeline/         # Modular chronological activity log & detail modals
│   │   ├── modal-content/# Module-specific modal view/edit logic
│   │   └── index.ts      # Component barrel exports
│   ├── Layout.tsx        # Application shell
│   └── DownloadReportButton.tsx
├── hooks/                # Custom hooks for state and data fetching
├── lib/
│   ├── utils.ts          # Shared formatting and helper functions
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # Core type definitions
│   ├── constants.ts      # App-wide constants
│   ├── google-fit.ts     # Google Fit helpers
│   ├── api.ts            # API client layer
│   └── pdfGenerator.ts   # PDF report generation
└── context/
    └── SupabaseContext.tsx # Database context provider
```

## Architecture & Design

The project follows a **Modular Separation of Layers** as defined in [GEMINI.md](file:///c:/Users/PC/Documents/web/my_proyects/daily-tracker-next/GEMINI.md):

- **Hooks Layer**: Isolates business logic and Supabase/API interactions.
- **Modules Layer**: Specialized components for specific data entry and visualization.
- **Timeline Layer**: A centralized chronological view of all daily activities, utilizing modular subcomponents for detail views and editing.
- **Utils Layer**: Pure functions for formatting and consistent UI helpers.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Database

Supabase handles persistence. Make sure your Supabase project has the following tables:

- `nutrition_logs`
- `training_logs`
- `study_logs`
- `mind_logs`
- `todos`
- `tags` (for task categorization)
- `todo_tags` (many-to-many relationship)
- `goals` (life goals tracking)
- `milestones` (goal progression)

## Google Fit Integration

The app integrates with Google Fit via OAuth. Users can connect their Google account in **Settings** to sync:
- Steps
- Active minutes
- Calories burned

## Deploy

```bash
vercel
```

Or push to GitHub and connect to Vercel for automatic CI/CD.
