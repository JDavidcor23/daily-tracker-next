'use client';

import { useState } from 'react';
import { DailyLog, Mood, MOODS } from '@/lib/types';
import {
  STRESS_DEFAULT,
  STRESS_MIN,
  STRESS_MAX,
  STRESS_LOW_THRESHOLD,
  STRESS_MEDIUM_THRESHOLD,
} from '@/lib/constants';

interface Props {
  onLog: (data: Partial<DailyLog>) => void;
}

export default function MindModule({ onLog }: Props) {
  const [mood, setMood] = useState<Mood | ''>('');
  const [stress, setStress] = useState(STRESS_DEFAULT);
  const [notes, setNotes] = useState('');

  const handleRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStress(Number(e.target.value));
  };

  const handleLog = () => {
    if (!mood) return;
    onLog({ mood, stress_level: stress, mind_notes: notes });
    setMood('');
    setStress(STRESS_DEFAULT);
    setNotes('');
  };

  const stressColor = (level: number) => {
    if (level <= STRESS_LOW_THRESHOLD) return 'text-emerald-600';
    if (level <= STRESS_MEDIUM_THRESHOLD) return 'text-amber-500';
    return 'text-rose-500';
  };

  const rangeProgress = `${((stress - STRESS_MIN) / (STRESS_MAX - STRESS_MIN)) * 100}%`;

  return (
    <div className="card module-section font-sans">
      <div className="module-header">
        <div className="module-icon bg-violet-50 dark:bg-violet-900/20">🧠</div>
        <div>
          <p className="module-title">Mental & Emotional</p>
          <p className="module-subtitle uppercase tracking-tight">Log your current state</p>
        </div>
      </div>

      <div>
        <label className="label">Current Mood</label>
        <div className="flex justify-between gap-1.5 mt-1">
          {MOODS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setMood(emoji)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl text-2xl transition-all border-2
                ${mood === emoji
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/40 scale-105 shadow-sm'
                  : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <span className="drop-shadow-sm">{emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Stress Level</label>
          <span className={`text-sm font-bold ${stressColor(stress)}`}>
            {stress}/{STRESS_MAX}
          </span>
        </div>
        <input
          type="range"
          min={STRESS_MIN}
          max={STRESS_MAX}
          step={1}
          value={stress}
          onChange={handleRange}
          className="w-full accent-brand-500"
          style={{ '--range-progress': rangeProgress } as React.CSSProperties}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <textarea
            className="input-field resize-none h-11 py-2.5"
            placeholder="Journal snippet..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button
          onClick={handleLog}
          disabled={!mood}
          className="btn-primary px-4"
        >
          Log
        </button>
      </div>
    </div>
  );
}
