'use client';

import { useState } from 'react';
import { DailyLog } from '@/lib/types';

interface Props {
  onLog: (data: Partial<DailyLog>) => void;
}

const TRAINING_TYPES = [
  'Strength', 'Cardio', 'HIIT', 'Yoga', 'Cycling',
  'Swimming', 'Running', 'Calisthenics', 'Other',
];

export default function TrainingModule({ onLog }: Props) {
  const [trained, setTrained] = useState(false);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleLog = () => {
    onLog({
      trained,
      train_type: trained ? type : '',
      train_duration: trained ? duration : '',
      train_notes: notes,
    });
    // Reset
    setTrained(false);
    setType('');
    setDuration('');
    setNotes('');
  };

  return (
    <div className="card module-section font-sans">
      <div className="module-header">
        <div className="module-icon bg-orange-50 dark:bg-orange-900/20">🏋️</div>
        <div>
          <p className="module-title">Training</p>
          <p className="module-subtitle uppercase tracking-tight">Log a workout or rest day</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {trained ? '✅ Trained' : '🛋️ Rest Day'}
        </span>
        <button
          type="button"
          onClick={() => setTrained(!trained)}
          className={`toggle w-11 h-6 rounded-full transition-colors relative ${trained ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${trained ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {trained && (
        <div className="space-y-4 pt-2 animate-fade-in">
          <div>
            <label className="label">Type</label>
            <select
              className="input-field"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select type…</option>
              {TRAINING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Duration</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 45 min"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input-field resize-none"
          rows={2}
          placeholder="Details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button onClick={handleLog} className="btn-primary w-full">
        Log Activity
      </button>
    </div>
  );
}
