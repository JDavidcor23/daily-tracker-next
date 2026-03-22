'use client';

import { useSettings } from '@/hooks/useSettings';
import { useSupabaseContext } from '@/context/SupabaseContext';

const SQL_SCHEMA = `
-- 1. Create the logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  food_meals text,
  food_notes text,
  trained boolean DEFAULT false,
  train_type text,
  train_duration text,
  train_notes text,
  study_topic text,
  study_time text,
  study_notes text,
  mood text,
  stress_level integer DEFAULT 5,
  mind_notes text,
  log_module text, -- 'nutrition', 'training', 'study', or 'mind'
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create the todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  text text NOT NULL,
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium',
  date date DEFAULT CURRENT_DATE,
  due_date date,
  description text
);

-- Enable RLS
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policies for logs
CREATE POLICY "Allow anon select logs" ON daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert logs" ON daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update logs" ON daily_logs FOR UPDATE USING (true);

-- Policies for todos
CREATE POLICY "Allow anon select todos" ON todos FOR SELECT USING (true);
CREATE POLICY "Allow anon insert todos" ON todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update todos" ON todos FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete todos" ON todos FOR DELETE USING (true);
`.trim();

const SQL_APP_SETTINGS = `
-- 3. Create app_settings table (required for Google Fit token storage)
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow anon select app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow anon insert app_settings" ON app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update app_settings" ON app_settings FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete app_settings" ON app_settings FOR DELETE USING (true);
`.trim();

const STATUS_COLORS: Record<string, string> = {
  connected: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400',
  disconnected: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400',
  checking: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400',
};

const STATUS_ICONS: Record<string, string> = {
  connected: '✅',
  disconnected: '❌',
  checking: '⏳',
};

const STATUS_MESSAGES: Record<string, string> = {
  connected: 'Connected to Supabase — All tables (daily_logs, todos) are reachable.',
  disconnected: 'Not connected. Check your credentials or run the SQL below.',
  checking: 'Checking connection…',
};

export default function SettingsPage() {
  const { status } = useSupabaseContext();
  const {
    url, setUrl,
    anonKey, setAnonKey,
    showKey, setShowKey,
    copied,
    copied2,
    gfitConnected,
    gfitLoading,
    handleConnectGoogleFit,
    handleDisconnectGoogleFit,
    handleSave,
    handleCopySQL,
  } = useSettings();

  return (
    <div className="px-4 py-8 space-y-8 max-w-3xl mx-auto font-sans animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Configure your personal tracker environment</p>
      </div>

      <div className={`card border-2 flex items-start gap-4 p-5 shadow-sm transition-all duration-300 ${STATUS_COLORS[status]}`}>
        <span className="text-2xl mt-0.5">{STATUS_ICONS[status]}</span>
        <div>
          <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-1">Connection Status</p>
          <p className="text-sm font-bold leading-tight">{STATUS_MESSAGES[status]}</p>
        </div>
      </div>

      <div className="card shadow-xl border-slate-100 dark:border-slate-800/50 p-6 space-y-6">
        <div className="module-header mb-0">
          <div className="module-icon bg-slate-100 dark:bg-slate-800">🔑</div>
          <div>
            <p className="module-title font-bold">Supabase Credentials</p>
            <p className="module-subtitle uppercase tracking-tight">Stored securely in your local environment</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label text-[10px]" htmlFor="sb-url">Project URL</label>
            <input
              id="sb-url"
              type="url"
              className="input-field"
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="label text-[10px]" htmlFor="sb-key">Anon / Public Key</label>
            <div className="relative">
              <input
                id="sb-key"
                type={showKey ? 'text' : 'password'}
                className="input-field pr-12 font-mono"
                placeholder="eyJhbGci…"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 group transition-all"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary w-full py-3.5 text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
        >
          Save & Verify Connection
        </button>
      </div>

      <div className="card shadow-md border-slate-100 dark:border-slate-800/30 p-6 space-y-4">
        <div className="module-header mb-0">
          <div className="module-icon bg-green-50 dark:bg-green-900/20">💪</div>
          <div>
            <p className="module-title font-bold">Google Fit Integration</p>
            <p className="module-subtitle uppercase tracking-tight">Automate your health tracking</p>
          </div>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-500 ${
          gfitConnected === null ? 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-900/30 dark:border-slate-800'
          : gfitConnected ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
          : 'bg-rose-50/50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${
            gfitConnected === null ? 'bg-white dark:bg-slate-800' : gfitConnected ? 'bg-white dark:bg-emerald-900' : 'bg-white dark:bg-rose-900'
          }`}>
            {gfitConnected === null ? '⏳' : gfitConnected ? '✅' : '❌'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-0.5">Google Fit Status</p>
            <p className="text-sm font-bold leading-none">{gfitConnected === null ? 'Syncing status…' : gfitConnected ? 'System active' : 'Offline'}</p>
          </div>
        </div>

        <div className="pt-2">
          {gfitConnected ? (
            <button
              onClick={handleDisconnectGoogleFit}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95"
            >
              <span>🔌</span> Disconnect Integration
            </button>
          ) : (
            <button
              onClick={handleConnectGoogleFit}
              disabled={gfitLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {gfitLoading ? <span>⏳ Connecting…</span> : <><span className="text-base">🔗</span> Connect Google Fit</>}
            </button>
          )}
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 italic">
          Permission required to securely read steps, calories, and sleep data. No health data is shared outside your environment.
        </p>
      </div>

      <div className="card shadow-md border-slate-100 dark:border-slate-800/30 p-6 space-y-4">
        <div className="module-header mb-0">
          <div className="module-icon bg-slate-100 dark:bg-slate-800">🗄️</div>
          <div>
            <p className="module-title font-bold">Database Setup</p>
            <p className="module-subtitle uppercase tracking-tight">Technical schema for self-hosting</p>
          </div>
        </div>

        {/* Main schema */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Step 1 — Core Tables</p>
          <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => handleCopySQL(SQL_SCHEMA)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                  ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800/80 text-white backdrop-blur-md hover:bg-slate-700'}`}
              >
                {copied ? '✅ Done' : <><span>📋</span> Copy</>}
              </button>
            </div>
            <div className="rounded-2xl bg-slate-900 text-blue-400 p-6 font-mono text-[10px] sm:text-xs overflow-x-auto shadow-inner ring-1 ring-slate-800 max-h-[260px] custom-scrollbar">
              <pre className="whitespace-pre">{SQL_SCHEMA}</pre>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium mt-2 px-1">
            Creates <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">daily_logs</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">todos</code> tables with RLS policies.
          </p>
        </div>

        {/* Google Fit tokens schema */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Step 2 — Google Fit Token Storage</p>
          <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => handleCopySQL(SQL_APP_SETTINGS, true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                  ${copied2 ? 'bg-emerald-500 text-white' : 'bg-slate-800/80 text-white backdrop-blur-md hover:bg-slate-700'}`}
              >
                {copied2 ? '✅ Done' : <><span>📋</span> Copy</>}
              </button>
            </div>
            <div className="rounded-2xl bg-slate-900 text-emerald-400 p-6 font-mono text-[10px] sm:text-xs overflow-x-auto shadow-inner ring-1 ring-slate-800 max-h-[260px] custom-scrollbar">
              <pre className="whitespace-pre">{SQL_APP_SETTINGS}</pre>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium mt-2 px-1">
            Required for Google Fit — stores OAuth tokens in <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">app_settings</code> instead of the filesystem (needed for Vercel).
          </p>
        </div>
      </div>

      <div className="pt-10 pb-6 text-center space-y-3 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-4xl drop-shadow-md">🌅</p>
        <p className="font-black text-slate-800 dark:text-slate-100 tracking-[0.2em] uppercase text-xs">Daily Life Tracker</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">v1.0.0 Alpha · Next.js Edition</p>
        <div className="flex items-center justify-center gap-4 text-[9px] text-brand-500 font-black uppercase tracking-tight">
          <span>💪 Health Sync</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>📈 Progress</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>✅ Task Core</span>
        </div>
      </div>
    </div>
  );
}
