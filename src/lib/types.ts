export type Mood = '😩' | '😕' | '😐' | '🙂' | '😄';
export type LogModule = 'nutrition' | 'training' | 'study' | 'mind';

export interface DailyLog {
  id?: string;
  date: string; // ISO date string YYYY-MM-DD
  log_module: LogModule;
  // Nutrition
  food_meals: string;
  food_notes: string;
  // Training
  trained: boolean;
  train_type: string;
  train_duration: string;
  train_notes: string;
  // Study
  study_topic: string;
  study_time: string;
  study_notes: string;
  // Mental/Emotional
  mood: Mood | '';
  stress_level: number;
  mind_notes: string;
  // Meta
  created_at?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  created_at?: string;
  text: string;
  completed: boolean;
  priority: Priority;
  date: string;
  due_date?: string;
  description?: string;
  is_repetitive: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

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

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export const MOODS: Mood[] = ['😩', '😕', '😐', '🙂', '😄'];

export const MOOD_LABELS: Record<Mood, string> = {
  '😩': 'Terrible',
  '😕': 'Bad',
  '😐': 'Neutral',
  '🙂': 'Good',
  '😄': 'Great',
};

export const DEFAULT_LOG: Omit<DailyLog, 'id' | 'created_at'> = {
  date: '',
  log_module: 'nutrition',
  food_meals: '',
  food_notes: '',
  trained: false,
  train_type: '',
  train_duration: '',
  train_notes: '',
  study_topic: '',
  study_time: '',
  study_notes: '',
  mood: '',
  stress_level: 5,
  mind_notes: '',
};

// Google Fit
export interface GoogleFitData {
  steps: number;
  calories: number;
  distance: number;       // km
  activeMinutes: number;
  sleepMinutes: number;
}

export interface GoogleFitStatus {
  connected: boolean;
  configured: boolean;
}
