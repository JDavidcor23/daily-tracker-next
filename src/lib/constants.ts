// Durations & timeouts
export const TOAST_DURATION_MS = 3000;
export const COPY_FEEDBACK_DURATION_MS = 2000;

// Time conversion
export const MINUTES_PER_HOUR = 60;

// Stress level config
export const STRESS_DEFAULT = 5;
export const STRESS_MIN = 1;
export const STRESS_MAX = 10;
export const STRESS_LOW_THRESHOLD = 3;
export const STRESS_MEDIUM_THRESHOLD = 6;

// Priority sort weights
export const PRIORITY_WEIGHTS: Record<string, number> = { high: 3, medium: 2, low: 1 };

// Todo
export const TODO_DESCRIPTION_PREVIEW_LENGTH = 40;
export const TODO_FALLBACK_SORT_DATE = '9999';

// Study time threshold for advanced icon (minutes)
export const STUDY_TIME_ADVANCED_THRESHOLD = 60;

// PDF layout
export const PDF_FONT_SIZE_TITLE = 24;
export const PDF_FONT_SIZE_SUBTITLE = 12;
export const PDF_FONT_SIZE_TABLE_MAIN = 11;
export const PDF_FONT_SIZE_TABLE_DETAIL = 10;
export const PDF_FONT_SIZE_FOOTER = 10;
export const PDF_MARGIN_HORIZONTAL = 40;
export const PDF_MARGIN_VERTICAL_START = 110;
export const PDF_TITLE_Y = 50;
export const PDF_SUBTITLE_Y = 70;
export const PDF_SEPARATOR_Y = 85;
export const PDF_SEPARATOR_END_X = 555;
export const PDF_SECTION_GAP = 30;
export const PDF_FOOTER_MARGIN_BOTTOM = 20;
export const PDF_COL_DATE_WIDTH = 70;
export const PDF_COL_CATEGORY_WIDTH = 70;
export const PDF_COL_DETAILS_WIDTH = 150;
export const PDF_SUBSECTION_INDENT = 20;
export const PDF_SUBSECTION_GAP = 15;
export const PDF_LEGEND_Y = 97;

// PDF section header colors
export const PDF_COLOR_SECTION_NUTRITION = '#10b981';
export const PDF_COLOR_SECTION_TRAINING = '#3b82f6';
export const PDF_COLOR_SECTION_STUDY = '#8b5cf6';
export const PDF_COLOR_SECTION_MIND = '#ec4899';
export const PDF_COLOR_SECTION_GOALS = '#6366f1';
export const PDF_COLOR_SECTION_MILESTONES = '#7c3aed';

// SVG icon size
export const SVG_ICON_SIZE = 18;

// Locale
export const DATE_LOCALE = 'en-US';

// Goals
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
