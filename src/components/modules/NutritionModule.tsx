'use client';

import { useState } from 'react';
import { DailyLog } from '@/lib/types';

interface Props {
  onLog: (data: Partial<DailyLog>) => void;
}

export default function NutritionModule({ onLog }: Props) {
  const [meals, setMeals] = useState('');
  const [notes, setNotes] = useState('');

  const handleLog = () => {
    if (!meals.trim()) return;
    onLog({ food_meals: meals, food_notes: notes });
    setMeals('');
    setNotes('');
  };

  return (
    <div className="card module-section font-sans">
      <div className="module-header">
        <div className="module-icon bg-emerald-50 dark:bg-emerald-900/20">🥗</div>
        <div>
          <p className="module-title">Nutrition</p>
          <p className="module-subtitle uppercase tracking-tighter">Log a meal or snack</p>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="food_meals">Meals / Food</label>
        <textarea
          id="food_meals"
          className="input-field resize-none"
          rows={3}
          placeholder="e.g. Oatmeal with blueberries..."
          value={meals}
          onChange={(e) => setMeals(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <textarea
            id="food_notes"
            className="input-field resize-none h-11 py-2.5"
            placeholder="Notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button
          onClick={handleLog}
          disabled={!meals.trim()}
          className="btn-primary py-2.5 px-4"
        >
          Log
        </button>
      </div>
    </div>
  );
}
